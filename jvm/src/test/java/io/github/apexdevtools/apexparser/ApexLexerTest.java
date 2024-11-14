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

import org.antlr.v4.runtime.*;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createLexer;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class ApexLexerTest {

    @Test
    void testLexerGeneratesTokens() {
        Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer("public class Hello {}", false);
        CommonTokenStream tokens  = new CommonTokenStream(lexerAndCounter.getKey());
        assertEquals(6, tokens.getNumberOfOnChannelTokens());
        assertEquals(0, lexerAndCounter.getValue().getNumErrors());
    }

    @Test
    void testCaseInsensitivityLowerCase() {
        Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer("public", true);
        CommonTokenStream tokens  = new CommonTokenStream(lexerAndCounter.getKey());
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
        assertEquals(0, lexerAndCounter.getValue().getNumErrors());
    }

    @Test
    void testCaseInsensitivityUpperCase() {
        Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer("PUBLIC", true);
        CommonTokenStream tokens  = new CommonTokenStream(lexerAndCounter.getKey());
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
        assertEquals(0, lexerAndCounter.getValue().getNumErrors());
    }

    @Test
    void testCaseInsensitivityMixedCase() {
        Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer("PuBliC", true);
        CommonTokenStream tokens  = new CommonTokenStream(lexerAndCounter.getKey());
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
        assertEquals(0, lexerAndCounter.getValue().getNumErrors());
    }

    @Test
    void testLexerUnicodeEscapes() {
        Map.Entry<ApexLexer, SyntaxErrorCounter> lexerAndCounter = createLexer("'Fran\\u00E7ois'", false);
        CommonTokenStream tokens = new CommonTokenStream(lexerAndCounter.getKey());
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
        assertEquals(0, lexerAndCounter.getValue().getNumErrors());
    }
}
