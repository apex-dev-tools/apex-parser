# SOQL SET OPTIONS support

Evidence checked on 2026-10-01 for [issue #165](https://github.com/apex-dev-tools/apex-parser/issues/165).

The [SOQL SET OPTIONS reference](https://developer.salesforce.com/docs/platform/salesforce-soql-sosl/guide/sforce-api-calls-soql-select-set-options.html) documents a parenthesized, comma-separated list of assignments: `dataspace` takes a single-quoted string and `honorEmptyStrings` takes `true` or `false`. The code examples are in the page HTML's `dx-code-block` attributes, which some text renderers omit. The [Summer ’26 developer guide](https://developer.salesforce.com/blogs/2026/06/the-salesforce-developers-guide-to-the-summer-26-release) places the clause at the very end of the query. This implementation appends it after the existing query tail and does not add it to subqueries.

The [Winter ’27 managed query release note](https://help.salesforce.com/s/articleView?id=release-notes.rn_apex_namespace_shadowing_managed_packages.htm&language=en_US&type=5) shows a whole-clause `:opts` bind supplied through `Database.query()` or `Database.queryWithBinds()`. Its builder enables namespace handling with a Boolean. The SOQL reference restricts that namespace behavior to managed dynamic Apex. No namespace-string assignment syntax is implemented. The linked Apex developer/reference pages rendered empty shells during this investigation; the accessible SOQL page and release note supply the primary evidence.

## Supported entry points

| Entry point                                                                 | Supported options                                                                                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `query()` (standalone SOQL, including separately parsed dynamic query text) | Literal list with `dataspace` / `honorEmptyStrings`, or whole-clause `boundExpression`                                  |
| `soqlLiteral()` and enclosing Apex rules                                    | Whole-clause `boundExpression`, including ordinary Apex expressions; verified live with an identifier and a method call |
| `subQuery()`                                                                | No SET OPTIONS addition                                                                                                 |

Inline bind support is based on actual API 68.0 compilation/execution below, using an empty `Database.QueryOptions` object. This establishes the bind syntax, **not** managed namespace semantics in inline Apex. Inline literal lists are excluded: they failed live compilation. Standalone query parsing does not identify whether a caller will send the text to REST or dynamic Apex; the latter rejected literal lists in the live probe. Callers must apply execution-context restrictions.

Object eligibility is semantic, not inferred from object-name suffixes. The reference requires a dataspace to obtain DLO records and excludes that option from DMO queries; `honorEmptyStrings` also supports simple DMO queries. The grammar cannot establish object metadata, query execution behavior, option object types, or managed packaging. It does not enforce an API gate: the note's API 34.0 mention concerns an older duplicate-field rule, not the introduction of SET OPTIONS.

`queryWithBinds()` resolves its placeholder from a map key. The live `queryOptionsKey` probe deliberately has no same-named Apex variable. Parsing a placeholder produces an identifier expression beneath `boundExpression`; this supplies syntax and traversal, not variable or map-key resolution. Dynamic string literals in Apex remain string literals and are not parsed as SOQL automatically.

## Bind parsing and semantic validation

Every entry point uses the existing `boundExpression : COLON expression` rule for the options bind, consistent with WHERE, LIMIT, OFFSET, and other binds. Parenthesized expressions, member access, and calls are parsed, as are syntactically valid expressions whose values would be inappropriate for `Database.QueryOptions`, such as `:true`, `:'package'`, or `:opts + 1`. These cases preserve expression nodes and visitor traversal so consumers can give type or context guidance. This does not add namespace-string option syntax or establish that these expressions are legal in dynamic SOQL. The live evidence establishes only the specific probes recorded below.

The parser does not impose an identifier-only predicate based on the query entry rule: standalone parsing cannot distinguish dynamic query text from an extracted inline fragment. Removing that predicate avoids a generic ANTLR failed-predicate diagnostic at the end of an otherwise parsed expression and keeps ordinary error recovery. Missing colons/expressions, incomplete expressions, invalid literal-list syntax, and misplaced clauses remain syntax or full-input consumption failures; standalone `query()` callers must check for trailing input because the rule can parse a prefix.

Consumers should validate options-bind value types, supported expression/placeholder forms for the known execution API, and managed execution context. In inline Apex this includes normal variable/member/method/operator validation and a `Database.QueryOptions` type check. For `queryWithBinds()` it means validating the supplied map key/value without resolving the key as an Apex variable. Current apex-ls performs general expression verification but has no options-specific type/context check and does not parse arbitrary dynamic query strings. A downstream options validator would need to retain/access `setOptionsClause().boundExpression()` separately from the existing flattened bind list. None of these semantic checks are added here.

## AST compatibility and downstream adoption

Existing `SoqlLiteralContext.query()`, `QueryContext.selectList()`, `fromNameList()`, grouping/function contexts, and expression subclasses remain intact. `setOptionsClause()` adds a child/accessor and literal assignments have `queryOption()` children. The whole-clause bind remains a `BoundExpressionContext` with its existing `expression()` child. Both target regressions check visitor discovery of WHERE and options binds, ordinary and semantically inappropriate bind-expression shapes in both entry points, and query shape. Generated rule/token numbers change; consumers must regenerate/recompile rather than relying on numeric values.

Read-only inspection of apex-ls `SOQL.apply` shows result classification still derives from the existing SELECT/function/grouping nodes and `BoundExprVisitor` traverses the query for `boundExpression`. A justified apex-ls follow-up is dependency adoption plus inline options-bind and standalone query regressions, asserting list/count/aggregate result classification and bind traversal. Platform `Database.QueryOptions` declarations belong to [apex-ls #595](https://github.com/apex-dev-tools/apex-ls/issues/595). Dynamic query map keys must not become static variable references; subscriber namespace resolution must not be emulated. No apex-ls files were changed or analyzer reproduction performed.

## Live verification

Used Salesforce CLI 2.140.6, org alias `pre-release`, connected instance API 68.0. All requests explicitly used `--api-version 68.0`; only read-only queries and anonymous Apex were executed, with no persistent changes. Baseline `SELECT Id FROM Account LIMIT 1` returned one record. A successful EntityDefinition query for `__dlm` / `__dll` names returned no records: no Data 360 objects were available/discoverable to this user. Thus actual DLO/DMO behavior and managed-package/subscriber namespace resolution remain unverified. Successful namespace-option calls in this org do not prove those semantics or broaden the documented managed-dynamic restriction.

Exact probes and sanitized outcomes follow. Record contents, org identity, and authentication material are omitted. Salesforce's inline compiler reports indirect error locations, preserved here without reinterpreting them as precise grammar diagnostics.

### REST probe

```sql
SELECT Id FROM Account LIMIT 1 SET OPTIONS (honorEmptyStrings = true)
```

```json
{
  "status": 0,
  "result": {
    "totalSize": 1
  }
}
```

### REST probe

```sql
SELECT Id FROM Account LIMIT 1 SET OPTIONS (dataspace = 'default')
```

```json
{
  "status": 0,
  "result": {
    "totalSize": 1
  }
}
```

### REST probe

```sql
SELECT Id FROM Account LIMIT 1 SET OPTIONS (explicitNamespace = true)
```

```json
{
  "status": 0,
  "result": {
    "totalSize": 1
  }
}
```

### REST probe

```sql
SELECT Id FROM Account SET OPTIONS (honorEmptyStrings = true) LIMIT 1
```

```json
{
  "status": 1,
  "name": "MALFORMED_QUERY",
  "message": "\nOPTIONS (honorEmptyStrings = true) LIMIT 1\n                                  ^\nERROR at Row:1:Column:62\nunexpected token: 'LIMIT'",
  "result": {}
}
```

### APEX probe

```java
List<Account> rows = [SELECT Id FROM Account LIMIT 1];
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": "",
    "exceptionStackTrace": "",
    "line": -1,
    "column": -1
  }
}
```

### APEX probe

```java
List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS (honorEmptyStrings = true)];
```

```json
{
  "status": 1,
  "name": "executeCompileFailure",
  "message": "Compilation failed at Line 1 column 5 with the error:\n\nUnexpected token '<'.",
  "result": {}
}
```

### APEX probe

```java
List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS (dataspace = 'default')];
```

```json
{
  "status": 1,
  "name": "executeCompileFailure",
  "message": "Compilation failed at Line 1 column 5 with the error:\n\nUnexpected token '<'.",
  "result": {}
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().withExplicitNamespace(true).build(); List<Account> rows = Database.query('SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts', AccessLevel.USER_MODE);
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": "",
    "exceptionStackTrace": "",
    "line": -1,
    "column": -1
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().withExplicitNamespace(true).build(); List<Account> rows = Database.queryWithBinds('SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts', new Map<String, Object>{'opts' => opts}, AccessLevel.USER_MODE);
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": "",
    "exceptionStackTrace": "",
    "line": -1,
    "column": -1
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().withExplicitNamespace(true).build(); List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts];
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": "",
    "exceptionStackTrace": "",
    "line": -1,
    "column": -1
  }
}
```

### APEX probe

```java
List<Account> rows = Database.query('SELECT Id FROM Account LIMIT 1 SET OPTIONS (honorEmptyStrings = true)', AccessLevel.USER_MODE);
```

```json
{
  "status": 1,
  "name": "executeRuntimeFailure",
  "message": "Execution failed at this code:\n\nSystem.QueryException: unexpected token: 'SET'",
  "result": {}
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts];
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": ""
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts]; System.assertEquals(1, rows.size());
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": ""
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); List<Account> rows = Database.query('SELECT Id FROM Account LIMIT 1 SET OPTIONS :opts', AccessLevel.USER_MODE);
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": ""
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); List<Account> rows = [SELECT Id FROM Account SET OPTIONS :opts LIMIT 1];
```

```json
{
  "status": 1,
  "name": "executeCompileFailure",
  "message": "Compilation failed at Line 1 column 75 with the error:\n\nUnexpected token '<'.",
  "result": {}
}
```

### APEX probe

```java
Object rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS (honorEmptyStrings = true)];
```

```json
{
  "status": 1,
  "name": "executeCompileFailure",
  "message": "Compilation failed at Line 1 column 8 with the error:\n\nUnexpected token 'rows'.",
  "result": {}
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); Map<String,Object> binds = new Map<String,Object>{'queryOptionsKey' => opts}; List<Account> rows = Database.queryWithBinds('SELECT Id FROM Account LIMIT 1 SET OPTIONS :queryOptionsKey', binds, AccessLevel.USER_MODE);
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": ""
  }
}
```

### APEX probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build(); Map<String,Database.QueryOptions> holder = new Map<String,Database.QueryOptions>{'opts' => opts}; List<Account> rows = [SELECT Id FROM Account LIMIT 1 SET OPTIONS :holder.get('opts')];
```

```json
{
  "status": 0,
  "result": {
    "compiled": true,
    "success": true,
    "compileProblem": "",
    "exceptionMessage": ""
  }
}
```

### APEX result typing probe

```java
Database.QueryOptions opts = Database.QueryOptions.builder().build();
Integer count = [SELECT COUNT() FROM Account SET OPTIONS :opts];
List<AggregateResult> grouped = [SELECT Name, COUNT(Id) FROM Account GROUP BY Name LIMIT 1 SET OPTIONS :opts];
System.assert(count > 0);
System.assertEquals(1, grouped.size());
```

```json
{
  "compiled": true,
  "success": true,
  "compileProblem": "",
  "exceptionMessage": ""
}
```
