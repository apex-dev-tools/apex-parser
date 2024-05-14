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

import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.*;

public class SOSLParserTest {
    @Test
    void testBasicQuery() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'something' RETURNING Account]");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testEmbeddedQuote() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'some\\'thing' RETURNING Account]");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testBracesFail() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find {something} RETURNING Account]");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(1, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testBracesOnAltFormat() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find {something} RETURNING Account]");
        ApexParser.SoslLiteralAltContext context = parserAndCounter.getKey().soslLiteralAlt();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testQuotesFailOnAltFormat() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'something' RETURNING Account]");
        ApexParser.SoslLiteralAltContext context = parserAndCounter.getKey().soslLiteralAlt();
        assertNotNull(context);
        assertEquals(1, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testWithUserModeQuery() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'something' RETURNING Account WITH USER_MODE WITH METADATA='Labels']");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testWithSystemModeQuery() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'something' RETURNING Account WITH METADATA='Labels' WITH SYSTEM_MODE]");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }
}
