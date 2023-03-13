# BigID

## Integration Benefits

TODO: Iterate the benefits of ingesting data from the provider into JupiterOne.
Consider the following examples:

- Visualize BigID data sources, finding objects, and users in the JupiterOne
  graph.
- Monitor changes to BigID finding counts per data source.
- Map data source and finding owners to employees in your JupiterOne account.

## How it Works

- JupiterOne periodically fetches data sources, finding objects, and users from
  BigID to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph, or
  leverage existing queries.
- Configure alerts to take action when JupiterOne graph changes, or leverage
  existing alerts.

## Prerequisites

- BigID supports token authentication using user credentials. You must use a
  user account with access to read data source infomration, finding object
  metadata, and BigID user data.
- You must have permission in JupiterOne to install new integrations.

## Support

If you need help with this integration, contact
[JupiterOne Support](https://support.jupiterone.io).

## How to Use This Integration

### In BigID

1. Identify an existing user or create a new user for use with the integration.
   A non-administrative role such as Inventory Analyst should have sufficient
   access.

### In JupiterOne

1. From the top navigation of the J1 Search homepage, select **Integrations**.
2. Scroll down to **BigID** and click it.
3. Click **Add Configuration** and configure the following settings:

- Enter the account name by which you want to identify this BigID account in
  JupiterOne. Select **Tag with Account Name** to store this value in
  `tag.AccountName` of the ingested assets.
- Enter a description to help your team identify the integration.
- Select a polling interval that is sufficient for your monitoring requirements.
  You can leave this as `DISABLED` and manually execute the integration.
- Enter the BigID URL, username, and password for use by JupiterOne.

4. Click **Create Configuration** after you have entered all the values.

## How to Uninstall

1. From the top navigation of the J1 Search homepage, select **Integrations**.
2. Scroll down to **BigID** and click it.
3. Identify and click the **integration to delete**.
4. Click the trash can icon.
5. Click **Remove** to delete the integration.
6. In BigID delete any no longer needed user accounts as needed.

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/main/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources   | Entity `_type`     | Entity `_class`  |
| ----------- | ------------------ | ---------------- |
| Account     | `bigid_account`    | `Account`        |
| Data Source | `bigid_datasource` | `DataCollection` |
| PII Object  | `bigid_pii_object` | `Record`         |
| User        | `bigid_user`       | `User`           |

### Relationships

The following relationships are created:

| Source Entity `_type` | Relationship `_class` | Target Entity `_type` |
| --------------------- | --------------------- | --------------------- |
| `bigid_account`       | **HAS**               | `bigid_user`          |
| `bigid_account`       | **SCANS**             | `bigid_datasource`    |
| `bigid_datasource`    | **HAS**               | `bigid_pii_object`    |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->
