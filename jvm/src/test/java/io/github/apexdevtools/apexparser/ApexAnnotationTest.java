/*
 Copyright (c) 2026 Kevin Jones, All rights reserved.
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

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

public class ApexAnnotationTest {

  /* Parse an annotation as a class modifier. compilationUnit ends in EOF, so the whole annotation
     has to be consumed for this to report no errors. */
  private ApexParser.AnnotationContext parseTypeAnnotation(String annotation) {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      annotation + " public class Hello {}"
    );
    ApexParser.CompilationUnitContext context = parserAndCounter
      .getKey()
      .compilationUnit();
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
    return context.typeDeclaration().modifier(0).annotation();
  }

  private int typeAnnotationErrors(String annotation) {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      annotation + " public class Hello {}"
    );
    parserAndCounter.getKey().compilationUnit();
    return parserAndCounter.getValue().getNumErrors();
  }

  private int memberAnnotationErrors(String annotation) {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "public class Hello { " + annotation + " public void func() {} }"
    );
    parserAndCounter.getKey().compilationUnit();
    return parserAndCounter.getValue().getNumErrors();
  }

  private List<ApexParser.ElementValuePairContext> pairs(String annotation) {
    ApexParser.ElementValuePairsContext pairs = parseTypeAnnotation(
      annotation
    ).elementValuePairs();
    assertNotNull(pairs);
    return pairs.elementValuePair();
  }

  private String valueOf(ApexParser.ElementValuePairContext pair) {
    return pair.elementValue().literal().getText();
  }

  @Test
  void testNoParameters() {
    ApexParser.AnnotationContext context = parseTypeAnnotation("@AuraEnabled");
    assertEquals("AuraEnabled", context.id().getText());
    assertNull(context.LPAREN());
    assertNull(context.elementValuePairs());
    assertNull(context.elementValue());
  }

  @Test
  void testEmptyParameters() {
    ApexParser.AnnotationContext context = parseTypeAnnotation(
      "@AuraEnabled()"
    );
    assertEquals("AuraEnabled", context.id().getText());
    assertNotNull(context.LPAREN());
    assertNull(context.elementValuePairs());
    assertNull(context.elementValue());
  }

  @Test
  void testSingleUnnamedValue() {
    ApexParser.AnnotationContext context = parseTypeAnnotation(
      "@SuppressWarnings('PMD')"
    );
    assertEquals("SuppressWarnings", context.id().getText());
    assertNull(context.elementValuePairs());
    assertNotNull(context.elementValue());
    assertEquals("'PMD'", context.elementValue().literal().getText());
  }

  @Test
  void testSingleNamedValue() {
    List<ApexParser.ElementValuePairContext> pairs = pairs(
      "@SuppressWarnings(value='PMD')"
    );
    assertEquals(1, pairs.size());
    assertEquals("value", pairs.get(0).id().getText());
    assertEquals("'PMD'", valueOf(pairs.get(0)));
  }

  @Test
  void testSpaceSeparatedPairs() {
    List<ApexParser.ElementValuePairContext> pairs = pairs(
      "@IsTest(SeeAllData=true IsParallel=false)"
    );
    assertEquals(2, pairs.size());
    assertEquals("SeeAllData", pairs.get(0).id().getText());
    assertEquals("true", valueOf(pairs.get(0)));
    assertEquals("IsParallel", pairs.get(1).id().getText());
    assertEquals("false", valueOf(pairs.get(1)));
  }

  /* The platform separates parameters by whitespace alone and rejects the comma form. It is
     accepted here deliberately, see the comment on elementValuePairs in BaseApexParser.g4. */
  @Test
  void testCommaSeparatedPairsAreAccepted() {
    List<ApexParser.ElementValuePairContext> pairs = pairs(
      "@IsTest(SeeAllData=true, IsParallel=false)"
    );
    assertEquals(2, pairs.size());
    assertEquals("SeeAllData", pairs.get(0).id().getText());
    assertEquals("IsParallel", pairs.get(1).id().getText());
  }

  @Test
  void testCommaSeparatedPairsAreAcceptedOnAMember() {
    assertEquals(
      0,
      memberAnnotationErrors("@IsTest(SeeAllData=true, IsParallel=false)")
    );
  }

  @Test
  void testTrailingCommaIsRejected() {
    assertEquals(1, typeAnnotationErrors("@IsTest(SeeAllData=true,)"));
  }

  @Test
  void testQuotedValueContainingCommas() {
    ApexParser.AnnotationContext context = parseTypeAnnotation(
      "@SuppressWarnings('PMD,Unused')"
    );
    assertEquals("'PMD,Unused'", context.elementValue().literal().getText());
  }

  @Test
  void testQuotedValueContainingSpaces() {
    List<ApexParser.ElementValuePairContext> pairs = pairs(
      "@InvocableMethod(label='Do a thing' category='Some, category')"
    );
    assertEquals(2, pairs.size());
    assertEquals("'Do a thing'", valueOf(pairs.get(0)));
    assertEquals("'Some, category'", valueOf(pairs.get(1)));
  }

  @Test
  void testStringLiteralValue() {
    assertNotNull(
      pairs("@InvocableMethod(label='x')")
        .get(0)
        .elementValue()
        .literal()
        .StringLiteral()
    );
  }

  @Test
  void testMultilineStringLiteralValue() {
    assertNotNull(
      pairs("@InvocableMethod(label='''\nx''')")
        .get(0)
        .elementValue()
        .literal()
        .MultilineStringLiteral()
    );
  }

  @Test
  void testBooleanLiteralValue() {
    assertNotNull(
      pairs("@AuraEnabled(cacheable=true)")
        .get(0)
        .elementValue()
        .literal()
        .BooleanLiteral()
    );
  }

  @Test
  void testIntegerLiteralValue() {
    assertNotNull(
      pairs("@InvocableMethod(label=42)")
        .get(0)
        .elementValue()
        .literal()
        .IntegerLiteral()
    );
  }

  @Test
  void testLongLiteralValue() {
    assertNotNull(
      pairs("@InvocableMethod(label=42L)")
        .get(0)
        .elementValue()
        .literal()
        .LongLiteral()
    );
  }

  @Test
  void testNumberLiteralValue() {
    assertNotNull(
      pairs("@InvocableMethod(label=4.2)")
        .get(0)
        .elementValue()
        .literal()
        .NumberLiteral()
    );
  }

  @Test
  void testNullLiteralValue() {
    assertNotNull(
      pairs("@AuraEnabled(cacheable=null)")
        .get(0)
        .elementValue()
        .literal()
        .NULL()
    );
  }

  /* Values the platform rejects still parse, so that apex-ls can diagnose them precisely rather
     than the file being lost to a syntax error. See apex-ls#326. */
  @Test
  void testTypeMismatchedValueStillParses() {
    assertEquals(0, typeAnnotationErrors("@AuraEnabled(cacheable=0)"));
    assertEquals(0, typeAnnotationErrors("@AuraEnabled(cacheable=null)"));
    assertEquals(0, typeAnnotationErrors("@InvocableMethod(label=42)"));
  }

  @Test
  void testQualifiedNameIsRejected() {
    assertTrue(typeAnnotationErrors("@Schema.AuraEnabled") > 0);
    assertTrue(memberAnnotationErrors("@Schema.AuraEnabled") > 0);
  }

  @Test
  void testArrayInitializerValueIsRejected() {
    assertTrue(typeAnnotationErrors("@InvocableMethod(label={'a','b'})") > 0);
    assertTrue(memberAnnotationErrors("@InvocableMethod(label={'a','b'})") > 0);
  }

  @Test
  void testNestedAnnotationValueIsRejected() {
    assertTrue(typeAnnotationErrors("@InvocableMethod(label=@IsTest)") > 0);
    assertTrue(memberAnnotationErrors("@InvocableMethod(label=@IsTest)") > 0);
  }

  @Test
  void testBareIdentifierValueIsRejected() {
    assertTrue(typeAnnotationErrors("@AuraEnabled(cacheable=foo)") > 0);
    assertTrue(memberAnnotationErrors("@AuraEnabled(cacheable=foo)") > 0);
  }

  @Test
  void testBareIdentifierUnnamedValueIsRejected() {
    assertTrue(typeAnnotationErrors("@SuppressWarnings(PMD)") > 0);
    assertTrue(memberAnnotationErrors("@SuppressWarnings(PMD)") > 0);
  }

  @Test
  void testExpressionValueIsRejected() {
    assertTrue(typeAnnotationErrors("@InvocableMethod(label='a' + 'b')") > 0);
    assertTrue(memberAnnotationErrors("@InvocableMethod(label='a' + 'b')") > 0);
  }
}
