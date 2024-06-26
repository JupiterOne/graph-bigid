import { GaxiosError, GaxiosOptions, GaxiosResponse, request } from 'gaxios';
import { parse } from 'csv-parse';
import {
  IntegrationProviderAuthenticationError,
  IntegrationLogger,
  IntegrationProviderAuthorizationError,
  IntegrationProviderAPIError,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import {
  DataSource,
  DataSourceResponse,
  FindingRow,
  SessionTokenResponse,
  User,
  UserResponse,
} from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  constructor(
    readonly config: IntegrationConfig,
    readonly logger: IntegrationLogger,
  ) {}

  private RATE_LIMIT_SLEEP_TIME = 30000;
  private BAD_GATEWAY_SLEEP_TIME = 5000;
  private MAX_RETRIES = 3;

  private AUTHENTICATION_ERROR_STRING = 'Authentication failed.';

  private BASE_URL = `${this.config.baseUrl}/api/v1`;
  private headers = {
    'Content-Type': 'application/json',
    Authorization: '',
  };

  public async verifyAuthentication(): Promise<void> {
    const requestOpts: GaxiosOptions = {
      url: this.BASE_URL + '/ds-connections?limit=1',
      method: 'GET',
      headers: this.headers,
    };
    let response;
    let retryCount = 0;
    while (!response && retryCount < this.MAX_RETRIES) {
      try {
        response = await this.requestWithRetry<SessionTokenResponse>(
          requestOpts,
        );
        if (response) return;
      } catch (err) {
        retryCount++;
        if (retryCount >= this.MAX_RETRIES) {
          throw err;
        }
        this.logger.info(`Caught error in verifyAuthentication. Retrying.`);
      }
    }
  }

  private async getSessionId(): Promise<string> {
    if (!this.headers.Authorization) {
      const requestOpts: GaxiosOptions = {
        url: this.BASE_URL + '/refresh-access-token',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.config.token,
        },
      };

      const response = await request<SessionTokenResponse>(requestOpts);
      this.checkForError(response);
      this.headers.Authorization = response.data.systemToken;
    }
    return this.headers.Authorization;
  }

  /**
   * Checks response for success.  In general, BigID doesn't respond with typical HTTP errors and instead
   * provides error feedback in a number of nonstandard ways.
   *
   * @param requestOptions GaxiosOptions outlining the particulars of the request
   */
  private checkForError(response: GaxiosResponse) {
    // We periodically see a 200 status with a data payload starting with "<html>\r\n<head><title>502 Bad Gateway</title>"
    // Checking for this and throwing so we can take advantage of our existing retry and error handling logic.
    if (
      response.data
        .toString()
        .startsWith('<html>\r\n<head><title>502 Bad Gateway</title>')
    ) {
      throw new GaxiosError(
        '502 Bad Gateway',
        {},
        {
          status: 502,
          config: response.config,
          data: response.data,
          statusText: '502 Bad Gateway',
          headers: response.headers,
          request: response.request,
        },
      );
    }

    if (response.data['success'] == false) {
      if (
        response.data['message'].startsWith(this.AUTHENTICATION_ERROR_STRING)
      ) {
        throw new GaxiosError(
          this.AUTHENTICATION_ERROR_STRING,
          {},
          {
            status: 401,
            config: response.config,
            data: response.data,
            statusText: this.AUTHENTICATION_ERROR_STRING,
            headers: response.headers,
            request: response.request,
          },
        );
      } else {
        throw new GaxiosError(
          response.data['message'],
          {},
          {
            status: 500,
            config: response.config,
            data: response.data,
            statusText: response.data['message'],
            headers: response.headers,
            request: response.request,
          },
        );
      }
    }
  }

  /**
   * Performs generic request and retries in the event of a 429 or 502.
   *
   * @param requestOptions GaxiosOptions outlining the particulars of the request
   */
  public async requestWithRetry<T>(
    requestOptions: GaxiosOptions,
  ): Promise<GaxiosResponse<T> | undefined> {
    let retryCounter = 0;

    do {
      try {
        await this.getSessionId();
        const response = await request<T>(requestOptions);
        this.checkForError(response);
        return response;
      } catch (err) {
        if (err.response?.status == 429) {
          // Stick to a timeout until we know if they offer a retry-after header.
          this.logger.info(
            `Encountered a rate limit.  Retrying in 30 seconds.`,
          );
          retryCounter++;
          await new Promise((resolve) =>
            setTimeout(resolve, this.RATE_LIMIT_SLEEP_TIME),
          );
        } else if (err.response?.status == 502) {
          this.logger.info(
            `Encountered a bad gateway.  Retrying in 5 seconds.`,
          );
          retryCounter++;
          await new Promise((resolve) =>
            setTimeout(resolve, this.BAD_GATEWAY_SLEEP_TIME),
          );
        } else if (err instanceof GaxiosError) {
          this.logger.info({ err }, 'Provider API error');
          throw this.createIntegrationError(
            err.response?.status as number,
            err.response?.statusText as string,
            err.response?.config?.url as string,
          );
        } else {
          throw new IntegrationError({
            message: err.message,
            code: err.name,
          });
        }
      }
    } while (retryCounter < this.MAX_RETRIES);
  }

  /**
   * Iterates each data source in the provider.
   *
   * @param iteratee receives each source to produce entities/relationships
   */
  public async iterateDataSources(
    iteratee: ResourceIteratee<DataSource>,
  ): Promise<void> {
    let count = 0;
    let totalCount = 0;

    do {
      const requestOpts: GaxiosOptions = {
        url:
          this.BASE_URL +
          `/ds-connections?skip=${count}&limit=100&requireTotalCount=true`,
        method: 'GET',
        headers: this.headers,
      };
      const response = await this.requestWithRetry<DataSourceResponse>(
        requestOpts,
      );
      if (response?.data.data) {
        count += response.data.data.ds_connections.length;
        totalCount = response.data.data.totalCount;

        this.logger.info(
          {
            count,
            totalCount,
            dsConnectionsLenght: response.data.data.ds_connections.length,
            totalCountResponse: response.data.data.totalCount,
          },
          'Data sources pagination state',
        );

        for (const source of response.data.data.ds_connections) {
          await iteratee(source);
        }
      } else {
        this.logger.info(
          { data: response?.data },
          `Empty message received when querying BigID data sources`,
        );
        return;
      }
    } while (count < totalCount);
  }

  /**
   * Iterates each PII finding.
   *
   * @param iteratee receives each finding to produce entities/relationships
   */
  public async iterateFindings(
    sourceName: string,
    iteratee: ResourceIteratee<FindingRow>,
  ): Promise<void> {
    // TODO (adam-in-ict) - Documentation at https://api.bigid.com/index-findings.html#get-/piiRecords/objects/file-download/export/
    // has a filter and a token that we should investigate further.  We have run into some timeout issues in the past and are
    // now filtering by Data Source.  Note that documentation for the filter was found to be inaccurate.  We may want to
    // investigate the token option further if it allows us to asynchronously await CSV creation and then perform a bulk
    // download.  Unfortunately, documentation has not yet proved fruitful for that.
    const requestOpts: GaxiosOptions = {
      url:
        this.BASE_URL +
        `/piiRecords/objects/file-download/export/?filter=source%3D` +
        sourceName,
      method: 'GET',
      headers: this.headers,
      timeout: 60_000,
    };
    const response = await this.requestWithRetry<string>(requestOpts);

    // Setting the columns value to `true` dynamically calculates the correct
    // columns, but also removes the header from the returned parsed objects.
    if (response?.data) {
      const parser = parse(response?.data, {
        delimiter: ',',
        columns: true,
      });
      for await (const finding of parser) {
        await iteratee(finding);
      }
    } else {
      this.logger.info(
        { sourceName },
        `Empty message received when querying BigID findings for data source`,
      );
      return;
    }
  }

  /**
   * Iterates users.
   *
   * @param iteratee receives each user to produce entities/relationships
   */
  public async iterateUsers(iteratee: ResourceIteratee<User>): Promise<void> {
    let count = 0;
    let totalCount = 0;

    do {
      const requestOpts: GaxiosOptions = {
        url:
          this.BASE_URL +
          `/access-management/users?skip=${count}&limit=100&requireTotalCount=true`,
        method: 'GET',
        headers: this.headers,
      };
      const response = await this.requestWithRetry<UserResponse>(requestOpts);
      if (response?.data.data) {
        count += response.data.data.users.length;
        totalCount = response.data.data.totalCount;
        for (const source of response.data.data.users) {
          await iteratee(source);
        }
      } else {
        this.logger.info(
          { data: response?.data },
          `Empty message received when querying BigID users`,
        );
        return;
      }
    } while (count < totalCount);
  }

  private createIntegrationError(
    status: number,
    statusText: string,
    endpoint: string,
  ) {
    this.logger.info(
      { status, statusText, endpoint },
      'Error when fetching data.',
    );
    switch (status) {
      case 401: {
        return new IntegrationProviderAuthenticationError({
          status,
          statusText,
          endpoint,
        });
      }
      case 403:
        return new IntegrationProviderAuthorizationError({
          status,
          statusText,
          endpoint,
        });
      default:
        return new IntegrationProviderAPIError({
          status,
          statusText,
          endpoint,
        });
    }
  }
}

let client: APIClient;

export function getOrCreateAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  if (!client) {
    client = new APIClient(config, logger);
  }
  return client;
}
