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
package io.github.apexdevtools.apexparser;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createLexer;
import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createLexerAndParser;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.github.apexdevtools.apexparser.ApexParserFactory.LexerAndParser;
import java.util.Map;
import org.antlr.v4.runtime.*;
import org.junit.jupiter.api.Test;

public class ApexLexerTest {

  @Test
  void testLexerGeneratesTokens() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer(
      "public class Hello {}"
    );
    CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
    assertEquals(6, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, lexerAndCounter.getValue().getNumErrors());
  }

  @Test
  void testCaseInsensitivityLowerCase() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer(
      "public"
    );
    CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, lexerAndCounter.getValue().getNumErrors());
  }

  @Test
  void testCaseInsensitivityUpperCase() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer(
      "PUBLIC"
    );
    CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, lexerAndCounter.getValue().getNumErrors());
  }

  @Test
  void testCaseInsensitivityMixedCase() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer(
      "PuBliC"
    );
    CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, lexerAndCounter.getValue().getNumErrors());
  }

  @Test
  @SuppressWarnings("deprecation")
  void testCaseInsensitivityDeprecated() {
    // intentional testing deprecated type backward compat
    ApexLexer lexer = new ApexLexer(
      new CaseInsensitiveInputStream(CharStreams.fromString("PuBliC"))
    );
    lexer.removeErrorListeners();
    SyntaxErrorCounter errorCounter = new SyntaxErrorCounter();
    lexer.addErrorListener(errorCounter);

    CommonTokenStream tokens = new CommonTokenStream(lexer);
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, errorCounter.getNumErrors());
  }

  @Test
  void testLexerUnicodeEscapes() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer(
      "'Fran\\u00E7ois'"
    );
    CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(0, lexerAndCounter.getValue().getNumErrors());
  }

  @Test
  void testLexerErrorCapturedViaCreateLexerAndParser() {
    Map.Entry<LexerAndParser, SyntaxErrorCounter> pairAndCounter =
      createLexerAndParser("public class X { String s = '\\q'; }");
    pairAndCounter.getKey().getParser().compilationUnit();
    assertTrue(pairAndCounter.getValue().getNumErrors() > 0);
  }

  // Salesforce Summer '26 multi-line string literals: '''<NL>...'''

  @Test
  void testMultilineStringBasic() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nhello\nworld'''"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(2, tokens.getNumberOfOnChannelTokens());
    assertEquals(ApexLexer.MultilineStringLiteral, tokens.get(0).getType());
  }

  @Test
  void testMultilineStringClosingOnOwnLine() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nhello\n'''"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(ApexLexer.MultilineStringLiteral, tokens.get(0).getType());
  }

  @Test
  void testMultilineStringEmptyBody() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer("'''\n'''");
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(ApexLexer.MultilineStringLiteral, tokens.get(0).getType());
  }

  @Test
  void testMultilineStringInternalQuotes() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nit's a 'test' with ''two'' quotes\nend'''"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(ApexLexer.MultilineStringLiteral, tokens.get(0).getType());
  }

  @Test
  void testMultilineStringEscapeSequences() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nescaped: \\'\\'\\'\nend'''"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(ApexLexer.MultilineStringLiteral, tokens.get(0).getType());
  }

  @Test
  void testMultilineStringLineTracking() {
    // Token after a 3-line literal should report line 4.
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nhello\nworld\n''' x"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    Token last = tokens.get(tokens.size() - 2); // skip EOF
    assertEquals("x", last.getText());
    assertEquals(4, last.getLine());
  }

  @Test
  void testMultilineStringFallbackWhenNewlineMissing() {
    // ''' without a following newline must NOT be lexed as a multi-line literal.
    // ANTLR falls back to legacy: '' 'abc' ''. apex-ls relies on this pattern
    // (apex-ls#443) to surface a targeted "did you mean a multi-line string?" diagnostic.
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer("'''abc'''");
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(4, tokens.size()); // '', 'abc', '', EOF
    assertEquals(ApexLexer.StringLiteral, tokens.get(0).getType());
    assertEquals("''", tokens.get(0).getText());
    assertEquals(ApexLexer.StringLiteral, tokens.get(1).getType());
    assertEquals("'abc'", tokens.get(1).getText());
    assertEquals(ApexLexer.StringLiteral, tokens.get(2).getType());
    assertEquals("''", tokens.get(2).getText());
  }

  @Test
  void testMultilineStringSixQuoteFallback() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer("''''''");
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertEquals(0, lc.getValue().getNumErrors());
    assertEquals(4, tokens.size()); // '', '', '', EOF
    assertEquals(ApexLexer.StringLiteral, tokens.get(0).getType());
    assertEquals(ApexLexer.StringLiteral, tokens.get(1).getType());
    assertEquals(ApexLexer.StringLiteral, tokens.get(2).getType());
  }

  @Test
  void testMultilineStringUnterminated() {
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\nnever closed"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertTrue(lc.getValue().getNumErrors() > 0);
  }

  @Test
  void testMultilineStringInvalidEscape() {
    // Apex platform rejects '\q' in both single- and triple-quoted strings.
    // A bare backslash in the body must form a valid EscapeSequence.
    Map.Entry<ApexLexer, SyntaxErrorCounter> lc = createLexer(
      "'''\ninvalid \\q here\n'''"
    );
    CommonTokenStream tokens = new CommonTokenStream(lc.getKey());
    tokens.fill();
    assertTrue(lc.getValue().getNumErrors() > 0);
  }
}
