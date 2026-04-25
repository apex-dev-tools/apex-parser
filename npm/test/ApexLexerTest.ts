/*
 Copyright (c) 2021 Kevin Jones, All rights reserved.
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
 */
import { CommonTokenStream } from "antlr4";
import {
  createLexer,
  createLexerAndParser,
  SyntaxErrorCounter,
} from "./SyntaxErrorCounter.js";
import { CaseInsensitiveInputStream } from "../src/CaseInsensitiveInputStream.js";
import ApexLexer from "../src/antlr/ApexLexer.js";

type ExtCommonTokenStream = CommonTokenStream & {
  // This method is present but not available
  // in antlr4 exported ts types (4.13.2)
  getNumberOfOnChannelTokens(): number;
};

test("Lexer generates tokens", () => {
  const [lexer, errorCounter] = createLexer("public class Hello {}");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(6);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity", () => {
  const [lexer, errorCounter] = createLexer("public");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity (upper case)", () => {
  const [lexer, errorCounter] = createLexer("PUBLIC");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity (mixed case)", () => {
  const [lexer, errorCounter] = createLexer("PuBliC");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity (deprecated stream)", () => {
  // intentional testing deprecated type backward compat
  const lexer = new ApexLexer(new CaseInsensitiveInputStream("PuBliC"));
  lexer.removeErrorListeners();
  const errorCounter = new SyntaxErrorCounter();
  lexer.addErrorListener(errorCounter);

  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Lexer unicode escapes", () => {
  const [lexer, errorCounter] = createLexer("'Fran\\u00E7ois'");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Lexer error is captured via createLexerAndParser", () => {
  const { parser, errorCounter } = createLexerAndParser(
    "public class X { String s = '\\q'; }"
  );
  parser.compilationUnit();
  expect(errorCounter.getNumErrors()).toBeGreaterThan(0);
});

// Salesforce Summer '26 multi-line string literals: '''<NL>...'''
// Body must start on a new line after the opening triple quote.

function lex(input: string): { tokens: CommonTokenStream; errors: number } {
  const [lexer, errorCounter] = createLexer(input);
  const tokens = new CommonTokenStream(lexer);
  tokens.fill();
  return { tokens, errors: errorCounter.getNumErrors() };
}

test("Multi-line string: basic body, closing on same line", () => {
  const { tokens, errors } = lex("'''\nhello\nworld'''");
  expect(errors).toEqual(0);
  // 1 MultilineStringLiteral + EOF
  expect((tokens as ExtCommonTokenStream).getNumberOfOnChannelTokens()).toBe(2);
  expect(tokens.tokens[0].type).toBe(ApexLexer.MultilineStringLiteral);
});

test("Multi-line string: closing on its own line", () => {
  const { tokens, errors } = lex("'''\nhello\n'''");
  expect(errors).toEqual(0);
  expect(tokens.tokens[0].type).toBe(ApexLexer.MultilineStringLiteral);
});

test("Multi-line string: empty body", () => {
  const { tokens, errors } = lex("'''\n'''");
  expect(errors).toEqual(0);
  expect(tokens.tokens[0].type).toBe(ApexLexer.MultilineStringLiteral);
});

test("Multi-line string: single and paired quotes inside body are allowed", () => {
  const { tokens, errors } = lex(
    "'''\nit's a 'test' with ''two'' quotes\nend'''"
  );
  expect(errors).toEqual(0);
  expect(tokens.tokens[0].type).toBe(ApexLexer.MultilineStringLiteral);
});

test("Multi-line string: escape sequences are honoured", () => {
  // \\'\\'\\' would terminate; \' \' \' should be three escaped quotes.
  const { tokens, errors } = lex("'''\nescaped: \\'\\'\\'\nend'''");
  expect(errors).toEqual(0);
  expect(tokens.tokens[0].type).toBe(ApexLexer.MultilineStringLiteral);
});

test("Multi-line string: line/column tracking continues after the literal", () => {
  // Token after a 3-line literal should report line 4.
  const { tokens, errors } = lex("'''\nhello\nworld\n''' x");
  expect(errors).toEqual(0);
  const last = tokens.tokens[tokens.tokens.length - 2]; // skip EOF
  expect(last.text).toBe("x");
  expect(last.line).toBe(4);
});

test("Multi-line string: fallback when newline missing — '''abc''' lexes as 3 string literals", () => {
  // ''' without a following newline must NOT be lexed as a multi-line literal.
  // ANTLR falls back to legacy: '' 'abc' ''. apex-ls relies on this pattern
  // (apex-ls#443) to surface a targeted "did you mean a multi-line string?" diagnostic.
  const { tokens, errors } = lex("'''abc'''");
  expect(errors).toEqual(0);
  expect(tokens.tokens.length).toBe(4); // '', 'abc', '', EOF
  expect(tokens.tokens[0].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[0].text).toBe("''");
  expect(tokens.tokens[1].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[1].text).toBe("'abc'");
  expect(tokens.tokens[2].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[2].text).toBe("''");
});

test("Multi-line string: six-quote sequence falls back to three empty string literals", () => {
  const { tokens, errors } = lex("''''''");
  expect(errors).toEqual(0);
  expect(tokens.tokens.length).toBe(4); // '', '', '', EOF
  expect(tokens.tokens[0].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[0].text).toBe("''");
  expect(tokens.tokens[1].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[1].text).toBe("''");
  expect(tokens.tokens[2].type).toBe(ApexLexer.StringLiteral);
  expect(tokens.tokens[2].text).toBe("''");
});

test("Multi-line string: unterminated literal produces a lexer error", () => {
  const { errors } = lex("'''\nnever closed");
  expect(errors).toBeGreaterThan(0);
});

test("Multi-line string: invalid backslash escape produces a lexer error", () => {
  // Apex platform rejects '\q' in both single- and triple-quoted strings.
  // A bare backslash in the body must form a valid EscapeSequence.
  const { errors } = lex("'''\ninvalid \\q here\n'''");
  expect(errors).toBeGreaterThan(0);
});
