# apex-parser

Parser for Salesforce Apex (including Triggers & inline SOQL/SOQL). This is based on an [ANTLR4](https://www.antlr.org/) grammar, see [`antlr/BaseApexParser.g4`](./antlr/BaseApexParser.g4). Currently packaged for Java and JavaScript/TypeScript targets.

With the ANTLR4 generated types, a `CaseInsensitiveInputStream` is included (and required) for the lexer. Type aliases and abstractions like `ApexParserFactory` and `ApexErrorListener` are also available for quick start. There are minimal examples in the test classes.

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
# Optionally install `antlr4` to use runtime types
npm i @apexdevtools/apex-parser
```

## Usage

`ApexParser` entry points to access tree:

- `compilationUnit()`, a class file.
- `triggerUnit()`, a trigger file.
- `query()`, a raw SOQL query.

### Explore Parse Tree (TypeScript)

```typescript
import { ApexParserFactory, ApexParserBaseVisitor } from "@apexdevtools/apex-parser";

const parser = ApexParserFactory.createParser("public class Hello {}");

/*
 * Use a visitor. Return value and manual control.
 */
class Visitor extends ApexParserBaseVisitor<any> {}

const visitor = new Visitor();
visitor.visit(parser.compilationUnit());


/*
 * Or walk with listener. Enter/exit operations - for whole tree.
 */
class Listener extends ApexParserBaseListener {}

const listener = new Listener();
ApexParseTreeWalker.DEFAULT.walk(listener, parser.compilationUnit());
```

### SOSL FIND quoting

SOSL FIND uses ' as a quoting character when embedded in Apex, in the API braces are used:

```sosl
Find {something} RETURNING Account
```

To parse the API format there is an alternative parser rule, `soslLiteralAlt`, that you can use instead of `soslLiteral`. See `SOSLParserTest` for some examples of how these differ.

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
# File and test name regex filtering
npm test -- ApexParserTest -t Expression

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
