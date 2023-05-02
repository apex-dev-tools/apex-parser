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

import org.junit.jupiter.api.Test;

import java.util.Map;

import static com.nawforce.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.*;

public class SOQLParserTest {
    @Test
    void testBasicQuery() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("[Find 'something' RETURNING Account]");
        ApexParser.SoslLiteralContext context = parserAndCounter.getKey().soslLiteral();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testSOQL() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("Select Fields(All) from Account");
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testCurrencyLiteral() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Id FROM Account WHERE Amount > USD100.01 AND Amount < USD200");
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testIdentifiersThatCouldBeCurrencyLiterals() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "USD100.name = 'name';");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testDateTimeLiteral() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Name, (SELECT Id FROM Account WHERE createdDate > 2020-01-01T12:00:00Z) FROM Opportunity");
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testNegativeNumericLiteral() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Name FROM Opportunity WHERE Value = -100.123");
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testLastQuarterKeyword() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Id FROM Account WHERE DueDate = LAST_QUARTER");
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testDistanceFunction() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Id, Distance(Address, :something, 'km') FROM Account WHERE Distance(Address, :something, 'km') < 10 ORDER BY Distance(Address, :something, 'km')"
        );
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testGeoLocationFunction() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "SELECT Id FROM Account WHERE Distance(Address, GeoLocation(:something, -23.33), 'km') < 10"
        );
        ApexParser.QueryContext context = parserAndCounter.getKey().query();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }
}
