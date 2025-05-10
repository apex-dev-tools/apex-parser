# apex-parser

Parser for Salesforce Apex (including Triggers & inline SOQL/SOQL). This is based on an [ANTLR4](https://www.antlr.org/) grammar, see [`antlr/BaseApexParser.g4`](./antlr/BaseApexParser.g4).

There are two builds of the parser available, a NPM module for use with Node and a Maven package for use on JVMs.

These builds just contain the Parser & Lexer and provides no further support for analysing the generated parse trees beyond what is provided by ANTLR4.

As Apex & SOQL/SOQL are case-insenstive languages you need to use the provided `CaseInsensitiveInputStream` for the parser to function correctly. When parsing Apex, inline SOQL/SOSL is automatically parsed, but you can also parse SOQL/SOQL directly. You can find some minimal examples in the test classes.

## Example

To parse a class file (NPM version):

```typescript
import { CommonTokenStream } from "antlr4";
import { ApexLexer, ApexParser, CaseInsensitiveInputStream } from "@apexdevtools/apex-parser";

const lexer = new ApexLexer(new CaseInsensitiveInputStream("public class Hello {}"));
const tokens = new CommonTokenStream(lexer);

const parser = new ApexParser(tokens);
const context = parser.compilationUnit();
```

The `context` is a `CompilationUnitContext` object which is the root of the parsed representation of the class. You can access the parse tree via functions on it.

## SOSL FIND quoting

SOSL FIND uses ' as a quoting character when embedded in Apex, in the API braces are used:

```sosl
Find {something} RETURNING Account
```

To parse the API format there is an alternative parser rule, `soslLiteralAlt`, that you can use instead of `soslLiteral`. See `SOSLParserTest` for some examples of how these differ.

## Installation

### Maven

```xml
<dependency>
    <groupId>io.github.apex-dev-tools</groupId>
    <artifactId>apex-parser</artifactId>
    <version><!-- version --></version>
</dependency>
```

### NPM

```sh
# install antlr4 to reference runtime types
# must match version used by parser
npm i antlr4 @apexdevtools/apex-parser
```

## Development

### Prerequisites

- JDK 11+ (for ANTLR tool)
- Maven
- NodeJS LTS

### Building

The outer package contains scripts to build both distributions:

```shell
# Run once - prepare for dev (installs deps, runs antlr gen)
npm run init

# Run antlr gen, compile and test
npm run build
```

Or you can setup and later build each distribution separately:

```shell
npm run init:npm
npm run build:npm

npm run init:jvm
npm run build:jvm
```

### Testing

#### Unit Tests

More options for testing:

```shell
# From ./npm
npm run build
npm test

# From ./jvm
mvn test
```

#### System Tests

The system tests use a collection of sample projects located in the [`apex-samples`](https://github.com/apex-dev-tools/apex-samples) repository. Follow the README instructions in `apex-samples` to checkout the submodules at the version tag used by the [build workflow](.github/workflows/Build.yml). Both packages must be built beforehand, as the js system test spawns the jar as well.

To run the tests:

```shell
# Set SAMPLES env var to samples repo location
export SAMPLES=<abs path to apex-samples>

# From root dir
npm run build
npm run systest
```

System test failures relating to the snapshots may highlight regressions. Though if an error is expected or the samples have changed, instead use `npm run systest:update` to update the snapshots, then commit the changes.

## Source & Licenses

All the source code included uses a 3-clause BSD license. The only third-party component included is the Apex Antlr4 grammar originally from [Tooling-force.com](https://github.com/neowit/tooling-force.com), although this version used is now markedly different from the original.
