# apex-parser

Parser for Salesforce Apex (including Triggers & inline SOQL/SOQL). This is based on an [ANTLR4](https://www.antlr.org/) grammar, see antlr/ApexParser.g4.

There are two builds of the parser available, a NPM module for use with Node and a Maven package for use on JVMs.

These builds just contain the Parser & Lexer and provides no further support for analysing the generated parse trees beyond what is provided by ANTLR4.

As Apex & SOQL/SOQL are case-insenstive languages you need to use the provided CaseInsensitiveInputStream for the parser to function correctly. When parsing Apex, inline SOQL/SOSL is automtaically parsed, but you can also parse SOQL/SOQL directly. You can find some minimal examples in the test classes.

## Example

To parse a class file (NPM version):

    let lexer = new ApexLexer(new CaseInsensitiveInputStream("public class Hello {}"))
    let tokens  = new CommonTokenStream(lexer);

    let parser = new ApexParser(tokens)
    let context = parser.compilationUnit()

The 'context' is a CompilationUnitContext object which is the root of the parsed representation of the class. You can access the parse tree via functions on it.

## Unicode handling

Prior to 2.12.0 the use of ANTLRInputStream for reading data in CaseInsensitiveStream would result character positions being given for UTF-16. The switch to CharStream input in 2.12.0 for JVM and 2.14.0 for node results in character positions reflecting Unicode code points.

## antlr4ts versions

The npm module uses antlr4ts 0.5.0-alpha.4, this was updated from 0.5.0-alpha.3 in the 2.9.1 version. You should make
sure that if you are using a matching versions of this dependency if you use it directly. To avoid issues you can
import 'CommonTokenStream' & 'ParseTreeWalker' from 'apex-parser' instead of from antlr4ts.

    import { CommonTokenStream} from "apex-parser";
    import { ParseTreeWalker } from "apex-parser";

## SOSL FIND quoting

SOSL FIND uses ' as a quoting character when embedded in Apex, in the API braces are used:

    Find {something} RETURNING Account

To parse the API format there is an alternative parser rule, soslLiteralAlt, that you can use instead of soslLiteral. See SOSLParserTest for some examples of how these differ.

## Packages

Maven

    <dependency>
        <groupId>io.github.apex-dev-tools</groupId>
        <artifactId>apex-parser</artifactId>
        <version>4.2.0</version>
    </dependency>

NPM

    "@apexdevtools/apex-parser": "^4.2.0"

## Building

To build both distributions:

    npm run build

## Testing

Unit tests are executed during the respective package builds. The system tests require both packages to be built, as the js test also spawns the jar version. They use a collection of sample projects located in the [apex-samples](https://github.com/apex-dev-tools/apex-samples) repository. Follow the README instructions in apex-samples to checkout the submodules. To run the tests:

    # Set SAMPLES env var to samples repo location
    export SAMPLES=<abs path to apex-samples>

    # Exec test script
    npm run test-samples

System test failures relating to the snapshots may highlight regressions. Though if an error is expected or the samples have changed, instead use `npm run test-snapshot` to update the snapshots, then commit the changes.

The tag version of apex-samples used by builds is set in the [build file](.github/workflows/Build.yml).

## Source & Licenses

All the source code included uses a 3-clause BSD license. The only third-party component included is the Apex Antlr4 grammar originally from [Tooling-force.com](https://github.com/neowit/tooling-force.com), although this version used is now markedly different from the original.
