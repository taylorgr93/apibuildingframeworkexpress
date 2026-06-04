# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Clean up debug console.log statements
- Update dependencies to latest versions

---

## [1.0.43] – 2026-06-04

### Added

- New `helpers/sanitize.js` module with `safeObjectId` (safe ObjectId parsing) and `sanitizeError` (error serialization for API responses)
- New `helpers/queryGenerators.js` module with extracted query builder functions (`GetGenericQueryId`, `GetGenericQueryBool`, `GetGenericQueryString`, `GetGenericComparisonQuery`, `GetDateComparisonQuery`, `GetGenericQueryNeid`, `GetGenericQueryNestring`, `GetGenericQueryPartial`, `CreateAndArr`, `objectIdWithTimestamp`)
- New `helpers/assignments.js` module with extracted `Assign`, `UnAssign`, and `UnAssignIdToCollections` functions

### Changed

- **`index.js`** Major refactor: extracted inline helper functions to dedicated helper modules, reducing file from ~1200 lines to ~400 lines
- **`listFilter`** and **`listFilter2`** unified to share query-building logic via `helpers/queryBuilders.js` and `helpers/queryGenerators.js`
- **`create`**, **`updatePatch`**, **`createMultipleCore`**, **`updatePatchMany`** error handling now throws `ApiErrorData` instead of manually sending error responses, preserving compatibility with Express error middleware
- Migrated remaining sync `fs` operations to async in legacy methods

### Removed

- Deleted `assing.js` (standalone legacy assignment module, replaced by `helpers/assignments.js`)
- Deleted `indexold.js` (obsolete backup of index.js)
- Removed dead/commented-out code and unused inline functions from `index.js`
- Removed direct `mongodb` ObjectId import from `index.js` (now handled via `helpers/sanitize.js`)

### Fixed

- Restored `throw ApiErrorData` in catch blocks that had been incorrectly replaced with inline `res.status().send()` during refactor, ensuring Express error middleware chain works correctly

---

## [1.0.42] – 2025-02-19

### Changed

- Replaced `uuid` package with native `crypto.randomUUID()` in uploadFileData.js and uploadFileDataNew.js

### Removed

- Removed `uuid` dependency from package.json

### Fixed

- Fixed ERR_REQUIRE_ESM and MODULE_NOT_FOUND errors caused by uuid v13 removal

---

## [1.0.41] – 2025-02-19

### Changed

- Replaced `uuid` package with native `crypto.randomUUID()` for file naming in uploadFileData.js

### Removed

- Removed `uuid` dependency from package.json

### Fixed

- Fixed ERR_REQUIRE_ESM error caused by uuid v13 being ES Module only

---

## [1.0.40] – 2025-02-17

### Added

- GitHub Actions workflow for automatic npm publishing on push to main
- Comprehensive README.md with API documentation
- Improved .gitignore for Node.js projects

### Changed

- Updated Node.js version in CI workflow from 16 to 18
- Updated `express` from ^4.18.1 to ^4.22.1
- Updated `express-validator` from ^7.0.1 to ^7.3.1
- Updated `mongoclienteasywrapper` from ^1.0.10 to ^1.2.7
- Updated `mongodb` from ^4.5.0 to ^4.17.2
- Updated `body-parser` from ^1.20.0 to ^1.20.4
- Updated `multer` from ^1.4.4 to ^2.0.2
- Updated `yup` from ^1.3.3 to ^1.7.1
- Updated `uuid` from ^8.3.2 to ^13.0.0

### Improved

- Expanded package keywords for better npm discoverability

### Documentation

- Added usage examples for all CRUD operations
- Documented query parameter filters and operators
- Added middleware and advanced usage sections

---

## [1.0.39] – 2025-09-26

### Added

- **`Updated`** multer dependency to 2.0.2 version for better file upload handling

### Changed

- **`create()`** Refactored method to use async file operations instead of sync, improving performance and avoiding event loop blocking.
- **`remove()`** Refactored method to use async file operations instead of sync, improving performance and avoiding event loop blocking.
- **`INTERNAL`** Replaced Promise.all() with Promise.allSettled() for assignments and unassignments operations to prevent complete failure when individual operations fail
- **`INTERNAL`** Improved request body handling to avoid mutations - now uses destructuring to extract special fields (\_Assign, \_Unassign, \_RecursiveDelete)

### Documentation

- **`Added`** inline comments in English for better code understanding.

---

## [1.0.38] and earlier

### Features (Historical)

- Generic CRUD operations for Express + MongoDB
- File upload handling with multer
- Schema validation with express-validator and yup
- Soft delete support (`status: "deleted"`)
- Pagination support
- Dynamic collection assignment/unassignment
- Query filtering with multiple operators (`_id`, `_string`, `_partial`, `_boolean`, `_neid`, `_nestring`, comparisons)
- Lookup/populate support via aggregation
- Sorting and projection options
