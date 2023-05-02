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
package com.nawforce.apexparser;

import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.StringReader;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ApexLexerTest {

    @Test
    void testLexerGeneratesTokens() {
        ApexLexer lexer = new ApexLexer(CharStreams.fromString("public class Hello {}"));
        CommonTokenStream tokens  = new CommonTokenStream(lexer);
        assertEquals(6, tokens.getNumberOfOnChannelTokens());
    }

    @Test
    void testCaseInsensitivityLowerCase() throws IOException {
        ApexLexer lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("public")));
        CommonTokenStream tokens  = new CommonTokenStream(lexer);
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
    }

    @Test
    void testCaseInsensitivityUpperCase() throws IOException {
        ApexLexer lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("PUBLIC")));
        CommonTokenStream tokens  = new CommonTokenStream(lexer);
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
    }

    @Test
    void testCaseInsensitivityMixedCase() throws IOException {
        ApexLexer lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("PuBliC")));
        CommonTokenStream tokens  = new CommonTokenStream(lexer);
        assertEquals(2, tokens.getNumberOfOnChannelTokens());
    }
}
