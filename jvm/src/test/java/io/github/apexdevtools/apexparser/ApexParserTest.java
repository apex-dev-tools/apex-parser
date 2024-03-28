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

import java.util.List;
import java.util.Map;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.*;

public class ApexParserTest {

    @Test
    void testBooleanLiteral() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("true");

        ApexParser.LiteralContext context = parserAndCounter.getKey().literal();
        assertNotNull(context);
        assertEquals("true", context.BooleanLiteral().getText());
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testExpression() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("a * 5");
        ApexParser.ExpressionContext context = parserAndCounter.getKey().expression();
        assertTrue(context instanceof ApexParser.Arth1ExpressionContext);
        assertEquals(2, ((ApexParser.Arth1ExpressionContext) context).expression().size());
    }

    @Test
    void testCoalesceExpression() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("a ?? 5");
        ApexParser.ExpressionContext context = parserAndCounter.getKey().expression();
        assertTrue(context instanceof ApexParser.CoalExpressionContext);
        assertEquals(2, ((ApexParser.CoalExpressionContext) context).expression().size());
    }

    @Test
    void testCoalescePrecedence() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("top ?? 100 - bottom ?? 0");
        ApexParser.ExpressionContext context = parserAndCounter.getKey().expression();
        assertTrue(context instanceof ApexParser.CoalExpressionContext);

        List<ApexParser.ExpressionContext> outer = ((ApexParser.CoalExpressionContext) context).expression();
        assertEquals(2, outer.size());

        assertTrue(outer.get(0) instanceof ApexParser.CoalExpressionContext);
        List<ApexParser.ExpressionContext> inner = ((ApexParser.CoalExpressionContext) outer.get(0)).expression();
        assertEquals(2, inner.size());

        assertTrue(inner.get(0) instanceof ApexParser.PrimaryExpressionContext);
        assertTrue(inner.get(1) instanceof ApexParser.Arth2ExpressionContext);

        assertTrue(outer.get(1) instanceof ApexParser.PrimaryExpressionContext);
    }

    @Test
    void testCoalescePrecedenceBoolean() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("a ?? false || b ?? false");
        ApexParser.ExpressionContext context = parserAndCounter.getKey().expression();
        assertTrue(context instanceof ApexParser.CoalExpressionContext);

        List<ApexParser.ExpressionContext> outer = ((ApexParser.CoalExpressionContext) context).expression();
        assertEquals(2, outer.size());

        assertTrue(outer.get(0) instanceof ApexParser.CoalExpressionContext);
        List<ApexParser.ExpressionContext> inner = ((ApexParser.CoalExpressionContext) outer.get(0)).expression();
        assertEquals(2, inner.size());

        assertTrue(inner.get(0) instanceof ApexParser.PrimaryExpressionContext);
        assertTrue(inner.get(1) instanceof ApexParser.LogOrExpressionContext);

        assertTrue(outer.get(1) instanceof ApexParser.PrimaryExpressionContext);
    }

    @Test
    void testClass() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("public class Hello {}");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testCaseInsensitivity() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("Public CLASS Hello {}");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testClassWithError() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("public class Hello {");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(1, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testClassWithSOQL() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "public class Hello {\n" +
                        "        public void func() {\n" +
                        "            List<Account> accounts = [Select Id from Accounts];\n" +
                        "        }\n" +
                        "    }");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testTrigger() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser("trigger test on Account (before update, after update) {}");
        ApexParser.TriggerUnitContext context = parserAndCounter.getKey().triggerUnit();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testSemiAllowedAsWhileBody() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "while (x++ < 10 && !(y-- < 0));");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testSemiAllowedAsForBody() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "for(x=0; x<10; x++);");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testSemiDisallowedAsGeneralStatement() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "if (x == 3); else { ; }");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(1, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testWhenLiteralParens() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "switch on (x) { \n" +
                        "  when 1 { return 1; } \n" +
                        "  when ((2)) { return 2; } \n" +
                        "  when (3), (4) { return 3; } \n" +
                        "}");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testWhenLiteralSigns() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                "switch on (x) { \n" +
                        "  when -1 { return 1; } \n" +
                        "  when (+2l) { return 1; } \n" +
                        "  when -+-3 { return 3; } \n" +
                        "}");
        ApexParser.StatementContext context = parserAndCounter.getKey().statement();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }

    @Test
    void testSoqlModeKeywords() {
        String [] MODES = new String[] { "USER_MODE", "SYSTEM_MODE" };
        for (String mode : MODES) {
            Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                    String.format("SELECT Id FROM Account WITH %s", mode));
            ApexParser.QueryContext context = parserAndCounter.getKey().query();
            assertNotNull(context);
            assertEquals(0, parserAndCounter.getValue().getNumErrors());
        }
    }

    @Test
    void testDmlModeKeywords() {
        String [] MODES = new String[] { "USER", "SYSTEM" };
        for (String mode : MODES) {
            Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
                    String.format("insert as %s contact;", mode));
            ApexParser.StatementContext context = parserAndCounter.getKey().statement();
            assertNotNull(context);
            assertEquals(0, parserAndCounter.getValue().getNumErrors());
        }
    }

    @Test
    void testDoWhileBlock() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter =
                createParser("public class Hello {{ do { System.debug(''); } while (true); }}");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(0, parserAndCounter.getValue().getNumErrors());
    }


    @Test
    void testDoWhileWithoutBlockFails() {
        Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter =
                createParser("public class Hello {{ do System.debug(''); while (true); }}");
        ApexParser.CompilationUnitContext context = parserAndCounter.getKey().compilationUnit();
        assertNotNull(context);
        assertEquals(3, parserAndCounter.getValue().getNumErrors());
    }

}

