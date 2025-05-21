/*
 [The "BSD licence"]
 Copyright (c) 2025 Kevin Jones, Certinia Inc.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import {
  CharStreams,
  CommonTokenStream,
  ErrorNode,
  ParserRuleContext,
  ParseTree,
  ParseTreeListener,
  ParseTreeVisitor,
  ParseTreeWalker,
  RuleNode,
  TerminalNode,
  Token,
} from "antlr4";
import ApexParserListener from "./antlr/ApexParserListener";
import ApexParserVisitor from "./antlr/ApexParserVisitor";
import ApexLexer from "./antlr/ApexLexer";
import ApexParser from "./antlr/ApexParser";
import { ThrowingErrorListener } from "./ApexErrorListener";

export type ApexParserRuleContext = ParserRuleContext;
export type ApexErrorNode = ErrorNode;
export type ApexParseTree = ParseTree;
export type ApexRuleNode = RuleNode;
export type ApexTerminalNode = TerminalNode;
export type ApexTokenStream = CommonTokenStream;
export type ApexToken = Token;

/**
 * A factory for `ApexParser` and its components. Abstracts interaction
 * with core ANTLR types like `CommonTokenStream`.
 */
export class ApexParserFactory {
  private constructor() {}

  static createParser(
    source: string | ApexTokenStream,
    throwOnFirstError: boolean = false
  ): ApexParser {
    const parser = new ApexParser(
      typeof source === "string"
        ? new CommonTokenStream(this.createLexer(source))
        : source
    );

    // always remove default console listener
    parser.removeErrorListeners();
    if (throwOnFirstError) {
      parser.addErrorListener(ThrowingErrorListener.INSTANCE);
    }
    return parser;
  }

  static createTokenStream(source: string | ApexLexer): ApexTokenStream {
    return new CommonTokenStream(
      typeof source === "string" ? this.createLexer(source) : source
    );
  }

  static createLexer(source: string): ApexLexer {
    const lexer = new ApexLexer(CharStreams.fromString(source));

    // always remove default console listener
    lexer.removeErrorListeners();
    return lexer;
  }
}

/**
 * A base visitor for an Apex parse tree produced by `ApexParser`. Extend this
 * class to define a subset of visitor operations.
 *
 * @see ApexParserVisitor for tree context visit operations.
 * @param Result The return type of the visit operation. Use `void` for
 * operations with no return type.
 * @example
 * // Implementations can be property or method styles.
 * visitCompilationUnit = (ctx: CompilationUnitContext) => { return result; }
 * visitCompilationUnit(ctx: CompilationUnitContext) { return result; }
 */
export class ApexParserBaseVisitor<Result>
  extends ParseTreeVisitor<Result>
  implements ApexParserVisitor<Result>
{
  visit(tree: ApexParseTree): Result {
    return super.visit(tree);
  }

  visitChildren(node: ApexRuleNode): Result {
    return super.visitChildren(node);
  }

  visitTerminal(node: ApexTerminalNode): Result {
    return super.visitTerminal(node);
  }

  visitErrorNode(node: ApexErrorNode): Result {
    return super.visitErrorNode(node);
  }
}

/**
 * A base listener for an Apex parse tree produced by `ApexParser`. Extend this
 * class to define a subset of listener operations.
 *
 * @see ApexParserListener for tree context listen operations.
 * @example
 * // Implementations can be property or method styles.
 * enterCompilationUnit = (ctx: CompilationUnitContext) => {}
 * enterCompilationUnit(ctx: CompilationUnitContext) {}
 */
export class ApexParserBaseListener
  extends ParseTreeListener
  implements ApexParserListener
{
  visitTerminal(node: ApexTerminalNode): void {}
  visitErrorNode(node: ApexErrorNode): void {}
  enterEveryRule(ctx: ApexParserRuleContext): void {}
  exitEveryRule(ctx: ApexParserRuleContext): void {}
}

/**
 * Walker for a parse tree starting at the root and going down recursively
 * with depth-first search.
 *
 * @example
 * const parser = ApexParserFactory.createParser("public class Foo {}");
 * const listener = new MyListener(); // extends ApexParseTreeListener
 * ApexParseTreeWalker.DEFAULT.walk(listener, parser.compilationUnit());
 */
export class ApexParseTreeWalker extends ParseTreeWalker {
  static DEFAULT = super.DEFAULT as ApexParseTreeWalker;

  walk<T extends ApexParserListener>(listener: T, t: ApexParseTree): void {
    super.walk(listener, t);
  }
}
