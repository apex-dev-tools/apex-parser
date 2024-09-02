# apex-parser - Changelog

## 4.2.0 - 2024-09-02

- Add support for multiple nested SOQL sub queries
- Add support for `GROUPING` in SOQL query
- Add support for `toLabel` in SOSL query

## 4.1.0 - 2024-05-12

- Allow WITH USER_MODE or SYSTEM_MODE on SOSL queries

## 4.0.0 - 2024-03-28

- Correct trigger body parsing to allow member declarations
- Add support for TYPEOF in SOQL subqueries
- Change com.nawforce.apexparser packages to io.github.apexdevtools.apexparser

## 3.6.0 - 2024-02-15

- Add null coalesce operator and expression

## 3.5.0 - 2023-10-15

- Correct do-while to require block rather than statement

## 3.4.0 - 2023-08-22

- Support +/- sequences on numeric literals in switch 'when' expressions

## 3.3.0 - 2023-04-30

- Update to ANTLR 4.9.1

## 3.2.0 - 2023-01-24

- Adds user/system mode on DML and within SOQL queries

## 3.1.0 - 2022-11-17

- Adds DISTANCE and GEOLOCATION literals for SOQL.
- Removes support for modulus operator to match apex.
- Use of `void.class` no longer causes syntax error.
- Now supports newer Date literals from API 55.

## 3.0.0 - 2022-06-14

- Initial github release.
