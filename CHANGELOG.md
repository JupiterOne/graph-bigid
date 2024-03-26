# v0.9.4 (Tue Mar 26 2024)

#### 🐛 Bug Fix

- INT-10033: ingest source tags into the entity and add mapped relation… [#18](https://github.com/JupiterOne/graph-bigid/pull/18) ([@gastonyelmini](https://github.com/gastonyelmini))

#### Authors: 1

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v0.9.3 (Thu Mar 14 2024)

#### 🐛 Bug Fix

- INT-10033: update tags response [#17](https://github.com/JupiterOne/graph-bigid/pull/17) ([@gastonyelmini](https://github.com/gastonyelmini))

#### Authors: 1

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v0.9.2 (Thu Mar 14 2024)

#### 🐛 Bug Fix

- INT-10033: check if response is iterable [#16](https://github.com/JupiterOne/graph-bigid/pull/16) ([@gastonyelmini](https://github.com/gastonyelmini))

#### Authors: 1

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v0.9.1 (Thu Mar 14 2024)

#### 🐛 Bug Fix

- INT-10033: change endpoint all-pairs due to 500 error [#15](https://github.com/JupiterOne/graph-bigid/pull/15) ([@gastonyelmini](https://github.com/gastonyelmini))

#### Authors: 1

- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v0.9.0 (Wed Mar 13 2024)

#### 🚀 Enhancement

- INT-10033: ingest datasource tags [#14](https://github.com/JupiterOne/graph-bigid/pull/14) ([@gastonyelmini](https://github.com/gastonyelmini))

#### ⚠️ Pushed to `main`

- Apply remove-codeql with multi-gitter [ci skip] ([@electricgull](https://github.com/electricgull))

#### Authors: 2

- Cameron Griffin ([@electricgull](https://github.com/electricgull))
- Gaston Yelmini ([@gastonyelmini](https://github.com/gastonyelmini))

---

# v0.8.0 (Mon Sep 11 2023)

#### 🚀 Enhancement

- INT-8682: add mapped relationship to aws_s3_bucket [#12](https://github.com/JupiterOne/graph-bigid/pull/12) ([@mishelashala](https://github.com/mishelashala))

#### 🐛 Bug Fix

- Update integration-deployment.yml [#11](https://github.com/JupiterOne/graph-bigid/pull/11) ([@Nick-NCSU](https://github.com/Nick-NCSU))

#### Authors: 2

- Michell Ayala ([@mishelashala](https://github.com/mishelashala))
- Nick Thompson ([@Nick-NCSU](https://github.com/Nick-NCSU))

---

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
