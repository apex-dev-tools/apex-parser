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
import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
