# apex-parser - Changelog

## 5.0.0

## General

- **(BREAKING)** Updated to ANTLR runtime `4.13.2`, using the ANTLR tool to generate both target languages.

- Enabled `caseInsensitive` option for lexers (added in ANTLR 4.10).
  - As a result, `CaseInsensitiveInputStream` is deprecated and should no longer be required.

- Added `ApexParserFactory` class to create parsers, token streams, and lexers.
  - Primarily for TS to avoid directly creating `antlr4` class instances.
  - In Java, it still requires passing a `CharStream` or `CommonTokenStream` to create parsers.

- Added abstract class `ApexErrorListener`:
  - Implement method `apexSyntaxError(line, column, message)` to avoid antlr specific types.

- Added support for parsing Anonymous Apex via `anonymousUnit` (.apex files) and `anonymousBlock` parser rules.

- Re-ordered `memberDeclaration` alternate rules to de-prioritise field declarations due to its `typeDef` rule.

### Java

- Added `Check.run` to programmatically run syntax check operation on a path.

### TypeScript/NPM

- **(BREAKING)** Migrated from `antlr4ts` to official `antlr4` runtime package.
  - Some lesser used methods are missing in the type definitions, refer to the [antlr4 Javascript code](https://github.com/antlr/antlr4/tree/dev/runtime/JavaScript/src/antlr4) if you need to cast types.
  - Generated `Listener`/`Visitor` interfaces are now abstract classes.
    - Introduced `Base` classes to extend instead, following pattern of Java classes of the same name. Change:
      - `implements ApexParserListener` to `extends ApexParserBaseListener`
      - `implements ApexParserVisitor<T>` to `extends ApexParserBaseVisitor<T>`
  - Parser rule contexts now have `_list()` methods for multi rules.
    - A rule `expr*` generates `expr_list()` and `expr(number)`.
    - By contrast Java would have overloads of `expr()`/`expr(int)` returning list or value.

- **(BREAKING)** Re-exported antlr classes `CommonTokenStream` and `ParseTreeWalker` removed.
  - Added type aliases like `ApexTokenStream`, `ApexParseTree`, and more to use with listener/visitor/walker.
  - For the walker, use `ApexParseTreeWalker.DEFAULT`. Same instance but typed for `ApexParserListener` and `ApexParseTree`.
  - It should no longer be required to depend on `antlr4` package directly.
    - Can still add the package as a dependency, but remember to match the version `apex-parser` uses.

- **(BREAKING)** Updated output to `ES2020` and increased min node version to 16.

- `CaseInsensitiveInputStream` (deprecated) type now extends `CharStream` and can be constructed from `string`.
  - Constructor passing in `CharStream` retained to match Java version.

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
