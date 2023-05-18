## [0.4.0] - 2023-05-15

### Changed

- Data source keys are now generated using the \_id field instead of name to
  avoid duplications.
- Findings are now queried per data source.

## [0.3.1] - 2023-03-27

### Changed

- We are now throwing IntegrationErrors instead of generic ones.

## [0.3.0] - 2023-03-16

### Added

- A mapped relationship is now created between bigid_datasource and AWS S3
  buckets.

## [0.2.1] - 2023-03-15

### Added

- AWS bucket names now included as a propety on bigid_datasource entities when
  available.

## [0.2.0] - 2023-03-14

### Added

- Initial implementation

  The following entities are created:

  | Resources   | Entity `_type`     | Entity `_class`  |
  | ----------- | ------------------ | ---------------- |
  | Account     | `bigid_account`    | `Account`        |
  | Data Source | `bigid_datasource` | `DataCollection` |
  | PII Object  | `bigid_pii_object` | `Record`         |
  | User        | `bigid_user`       | `User`           |

  The following relationships are created:

  | Source Entity `_type` | Relationship `_class` | Target Entity `_type` |
  | --------------------- | --------------------- | --------------------- |
  | `bigid_account`       | **HAS**               | `bigid_user`          |
  | `bigid_account`       | **SCANS**             | `bigid_datasource`    |
  | `bigid_datasource`    | **HAS**               | `bigid_pii_object`    |
