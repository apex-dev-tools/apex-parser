# apex-parser - Changelog

## 5.0.0

- (BREAKING) Migrated from `antlr4ts` to official `antlr4` runtime package.
  - Some lesser used methods are missing in the type definitions, refer to the [antlr4 Javascript code](https://github.com/antlr/antlr4/tree/dev/runtime/JavaScript/src/antlr4) if you need to cast types.
  - `extends` is now required to use antlr `Listener`/`Visitor` types.
    - Exception being to avoid the property initialisation syntax in the antlr generated types:

      ```apex
      class MyListener extends ParseTreeListener implements ApexParserListener {
        // with 'extends ApexParserListener' you must write this
        enterMethodDeclaration = () => {}

        // this requires 'extends ParseTreeListener implements ApexParserListener'
        enterMethodDeclaration() {}
      }
      ```

- (BREAKING) Updated output to `ES2020` and increased min node version to 16.
- (BREAKING) Updated to ANTLR `4.13.2` across both distributions. Same tool now generates both.
- (BREAKING) Re-exported antlr types removed, add `antlr4` package dep instead matching apex-parser version.
- Typescript `CaseInsensitiveInputStream` type now extends `CharStream` and can be constructed from `string`.
  - Constructor passing in `Charstream` retained to match Java version.
- Removed `node-dir` dependency - replaced with node fs api.

## 4.4.0 - 2024-12-14

- Support `TimeLiteral` for `Time` fields, e.g. `WHERE TimeField__c = 01:00:00.000Z` for SOQL queries

## 4.3.1 - 2024-11-12

- Fix Lexer support for uppercase Hex
- Fix parser `whenValue` to support type refs

## 4.3.0 - 2024-09-26

- Add `convertCurrency` and `FORMAT` SOQL/SOSL functions
- Support nested functions in `FORMAT`
- Support aliases on SOSL functions

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
