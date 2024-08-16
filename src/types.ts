export interface SessionTokenResponse {
  success: boolean;
  systemToken: string;
}

export interface DataSourceTag {
  tagId: string;
  tagName: string;
  tagValue: string;
  valueId: string;
}

export interface DataSource {
  _id: string;
  owners: [string];
  differential: boolean;
  password: string;
  name: string;
  credential_id: string;
  certificate_id: string;
  rdb_is_sample_data: boolean;
  numberOfParsingThreads: string;
  include_file_types: boolean;
  awsAuthStrategy: number;
  isCredentialsAuth: boolean;
  dataSourceObjectNamesToExcludeRegex: string;
  smbServer: string;
  sharedResource: string;
  is_credential: boolean;
  updatedPasswords: [];
  type: string;
  security_tier: string;
  scanner_strategy: string;
  enabled: string;
  keyDeserializer: string;
  valueDeserializer: string;
  custom_fields: [];
  created_at: string;
  updated_at: string;
  last_scan_at: 1671638184986;
  owners_v2: [
    {
      id: string;
      email: string;
      origin: string;
      type: string;
      isNotified: boolean;
    },
  ];
  connectionStatusTest: {
    is_success: boolean;
    last_connection: string;
  };
  connectionStatusDeleteFindings: {};
  id: string;
  Is_sample_files: string;
  Is_sample_folders: string;
  classification_is_enabled: boolean;
  doc2vec_is_enabled: boolean;
  is_encrypt_data: string;
  is_ocr_enabled: string;
  is_system_shares: boolean;
  multiple_shares_enabled: boolean;
  ner_classification_is_enabled: boolean;
  scanWindowName: [];
  scanner_group: string;
  connectionStatusScan: {
    is_success: boolean;
    last_connection: string;
  };
  tags: DataSourceTag[];
  aws_region?: string;
  bucket_name?: string;
  resourceProperties?: {
    resourceEntry?: string;
  };
  systemId?: string;
}

export interface DataSourceResponse {
  status: string;
  statusCode: number;
  data: {
    ds_connections: [DataSource];
    totalCount: number;
  };
  message: string;
}

export const FindingCsvHeaders = [
  'Data Source',
  'Type',
  'Full Object Name',
  'Object Name',
  'Owner',
  'Modified Date',
  'Attributes',
  'Entity Sources',
  'Residencies',
  'PII Count',
  'Open Access',
  'DataSource Owner',
  'Location',
  'Number of Entities',
];

export interface FindingRow {
  'Data Source': string;
  Type: string;
  'Full Object Name': string;
  'Object Name': string;
  Owner: string;
  'Modified Date': string;
  Attributes: string;
  'Entity Sources': string;
  Residencies: string;
  'PII Count': string;
  'Open Access': string;
  'DataSource Owner': string;
  Location: string;
  'Number of Entities': string;
}

export interface User {
  _id: string;
  created_at: string;
  updated_at: string;
  name: string;
  firstName: string;
  password: string;
  admin: boolean;
  __v: number;
  roleIds: [string];
  last_successful_login_at: string;
  token: string;
  isPasswordChangeNeeded: boolean;
  lastName: string;
  id: string;
}

export interface UserResponse {
  status: string;
  statusCode: number;
  data: {
    users: [User];
    totalCount: number;
  };
  message: string;
}
