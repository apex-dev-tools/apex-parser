# apex-parser - Changelog

## Unreleased

- Tighten the annotation grammar to reject constructs that are inherited from Java but are not legal Apex
  - `annotation` matches `id` in place of `qualifiedName`; `@Schema.AuraEnabled` is now a syntax error, matching the platform (`Unexpected token '.'`). Apex has no user-defined annotations, so a namespace-qualified form has never been legal
  - `elementValue` matches `literal` in place of `expression`, so a bare identifier value such as `@AuraEnabled(cacheable=foo)` is now a syntax error, as it is on the platform
  - Nested annotations and array initialiser values (`label={'a','b'}`) are no longer accepted, and the `elementValueArrayInitializer` rule is removed. `elementValue` is now non-recursive
  - **(SOURCE BREAKING)** `ElementValueArrayInitializerContext` is no longer generated, `AnnotationContext.qualifiedName()` becomes `id()`, and `ElementValueContext` exposes only `literal()`. Tree-walking consumers referencing these need updating. This ships as a minor version, not a major one; grammar changes of this kind are routine here and major bumps are reserved for build-environment or large-scale changes
  - The optional `COMMA` separator between annotation parameters is deliberately kept, and is now documented in the grammar as the one exception. The platform separates parameters by whitespace alone, but rejecting the comma form at parse time reproduces the platform compiler's own failure mode, where a member-level annotation is recovered as a constructor declaration and the rest of the file is lost to cascading errors
  - Values the platform rejects for type reasons, such as `@AuraEnabled(cacheable=0)` and `cacheable=null`, still parse. That is intended, so a consumer can diagnose the value precisely instead of losing the file to a syntax error
  - Adds annotation parameter test coverage to both the maven and npm targets
- Add [`doc/SalesforceDifferences.md`](doc/SalesforceDifferences.md), recording deliberate differences between what this grammar accepts and what the Salesforce platform compiler accepts, so they are not mistakenly "corrected" later. The first entry is the annotation parameter comma separator above
- Fix the `dataCategoryName` grammar rule so parenthesized SOQL data category lists close with `RPAREN`; previously, valid multi-category `WITH DATA CATEGORY` filters failed to parse.
- Support the SOSL `WITH SPELL_CORRECTION = { true | false }` clause, e.g. `[FIND :term IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = false]`; an Apex bind variable (`:expr`) is also accepted in place of the literal
- Support the SOSL `WITH HIGHLIGHT` clause, e.g. `[FIND 'salesforce' IN ALL FIELDS RETURNING Account(Name, Description) WITH HIGHLIGHT]`
- New `HIGHLIGHT` and `SPELL_CORRECTION` lexer tokens; both are also accepted as identifiers (`id`/`anyId`), so existing code using them as names is unaffected
- Fix `WITH DATA CATEGORY` filters with more than one selection. `filteringExpression` joined selections with the `AND` token, which is the Java `&&` operator, not the SOQL `and` keyword. In SOSL this was a parse error; in SOQL the trailing selections were silently left unconsumed

## 5.1.0 - 2026-07-03

- Allow functions in `GROUP BY` clause of SOQL queries
- Support Apex bind variables (`:expr`) in SOSL `WITH DIVISION` clause
- Support fully-qualified enum values in switch `when` clauses, e.g. `when MyClass.MyEnum.VALUE`
  - `whenLiteral` now matches `qualifiedName` in place of `id`, so bare enum values like `when VALUE` now parse as `WhenLiteral > qualifiedName > id` rather than `WhenLiteral > id` (AST shape change for tree-walking consumers)
- Support multi-line string literals (Salesforce Summer '26), e.g. `String json = '''<NL>{...}<NL>''';`
  - New `MultilineStringLiteral` token, accepted alongside `StringLiteral` in literal/SOQL/SOSL contexts.
  - Body must start on a new line after the opening `'''`, matching platform behaviour. Malformed forms like `'''abc'''` continue to lex as legacy `StringLiteral` tokens (`''`, `'abc'`, `''`); apex-ls consumes this pattern to surface a targeted diagnostic (apex-ls#443).
- Support the SOQL `FORMULA()` function in `WHERE` clauses, e.g. `WHERE FORMULA('...') = true`; use in any other clause (e.g. `HAVING FORMULA(...)`) reports a syntax error.
- Fix `npm run check` failing with `ERR_REQUIRE_ESM` on Node 20+ by switching the script from `require()` to dynamic `import()` (the package is `"type": "module"`).
- Update npm package build output to publish separate ESM, CommonJS, browser, and TypeScript declaration artifacts through the package `exports` map.

## 5.0.0 - 2026-04-21

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

- **(BREAKING)** Updated to ES Module format. Node 20/22, TypeScript 5.9 support `require(esm)`.
  - Increased min node version to 20.
  - `antlr4` has to be patched to fix module resolution of the type declaration files.
    - The patch is applied to a bundled version of the package.
    - For reference it is also published under `patches/*`.

- **(BREAKING)** Re-exported antlr classes `CommonTokenStream` and `ParseTreeWalker` removed.
  - Added type aliases like `ApexTokenStream`, `ApexParseTree`, and more to use with listener/visitor/walker.
  - For the walker, use `ApexParseTreeWalker.DEFAULT`. Same instance but typed for `ApexParserListener` and `ApexParseTree`.
  - It should no longer be required to depend on `antlr4` package directly.
    - Can still add the package as a dependency, but remember to match the version `apex-parser` uses.

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
