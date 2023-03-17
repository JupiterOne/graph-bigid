# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
