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

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import org.junit.jupiter.api.Test;

public class SOSLParserTest {

  @Test
  void testBasicQuery() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find 'something' RETURNING Account]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testEmbeddedQuote() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find 'some\\'thing' RETURNING Account]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testBracesFail() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find {something} RETURNING Account]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(1, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testBracesOnAltFormat() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find {something} RETURNING Account]"
    );
    ApexParser.SoslLiteralAltContext context = parserAndCounter
      .getKey()
      .soslLiteralAlt();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testQuotesFailOnAltFormat() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find 'something' RETURNING Account]"
    );
    ApexParser.SoslLiteralAltContext context = parserAndCounter
      .getKey()
      .soslLiteralAlt();
    assertNotNull(context);
    assertEquals(1, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithUserModeQuery() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find 'something' RETURNING Account WITH USER_MODE WITH METADATA='Labels']"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSystemModeQuery() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[Find 'something' RETURNING Account WITH METADATA='Labels' WITH SYSTEM_MODE]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testToLabel() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND :searchTerm IN ALL FIELDS RETURNING Account(Id, toLabel(Name)) LIMIT 10]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testToLabelWithAlias() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND :searchTerm IN ALL FIELDS RETURNING Account(Id, toLabel(Name) AliasName) LIMIT 10]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testConvertCurrency() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[ FIND 'test' RETURNING Opportunity(Name, convertCurrency(Amount), convertCurrency(Amount) AliasCurrency) ]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testConvertCurrencyWithFormat() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[ FIND 'Acme' RETURNING Account(AnnualRevenue, FORMAT(convertCurrency(AnnualRevenue)) convertedCurrency) ]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormatWithAggregate() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[ FIND 'Acme' RETURNING Account(AnnualRevenue, FORMAT(MIN(CloseDate))) ]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testBindVarInDivisionClause() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND :q IN ALL FIELDS RETURNING Account WITH DIVISION = :d LIMIT :l]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSpellCorrection() {
    // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_spell_correction.htm
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'San Francisco' IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = false]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSpellCorrectionTrue() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND :searchTerm IN ALL FIELDS RETURNING Contact(Id, FirstName, LastName) WITH SPELL_CORRECTION = true]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSpellCorrectionOnAltFormat() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND {San Francisco} IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = false]"
    );
    ApexParser.SoslLiteralAltContext context = parserAndCounter
      .getKey()
      .soslLiteralAlt();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testBindVarInSpellCorrectionClause() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND :q IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = :correct]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithHighlight() {
    // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_highlight.htm
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'salesforce' IN ALL FIELDS RETURNING Account(Name,Description) WITH HIGHLIGHT]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithHighlightOnCustomObject() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Salesforce West' IN ALL FIELDS RETURNING Building__c(Name, BuildingDescription__c) WITH HIGHLIGHT]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithHighlightAndSpellCorrection() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'salesforce' IN ALL FIELDS RETURNING Account(Name) WITH HIGHLIGHT WITH SPELL_CORRECTION = false LIMIT 10]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSnippetTargetLength() {
    // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_snippet.htm
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'San Francisco' IN ALL FIELDS RETURNING KnowledgeArticleVersion(id, title WHERE PublishStatus = 'Online' AND Language = 'en_US') WITH SNIPPET (target_length=120)]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithSnippetNoTargetLength() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'San Francisco' IN ALL FIELDS RETURNING FeedItem, FeedComment WITH SNIPPET]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithNetworkEquals() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING User(Id, Name) WITH NETWORK = '0DBxx0000000123']"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithNetworkIn() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING User(Id, Name) WITH NETWORK IN ('0DBxx0000000123', '0DBxx0000000456')]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithPricebookId() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'laptop' RETURNING Product2(Id, Name WHERE ProductCode = 'ABC-123') WITH PricebookId = '01sxx0000002MffAAE']"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithMetadataLabels() {
    // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_metadata.htm
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING Account(Id, Name) WITH METADATA='LABELS']"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithDivision() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING Account(Id, Name) WITH DIVISION = 'Global']"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithDataCategory() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING KnowledgeArticleVersion(Id, Title) WITH DATA CATEGORY Location__c AT America__c AND Product__c ABOVE_OR_BELOW mobile_phones__c]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testWithDataCategoryList() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[FIND 'Acme' RETURNING KnowledgeArticleVersion(Id, Title) WITH DATA CATEGORY Geography__c AT (usa__c, uk__c)]"
    );
    ApexParser.SoslLiteralContext context = parserAndCounter
      .getKey()
      .soslLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testHighlightAsIdentifier() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "public class Dummy { void f() { String highlight = 'a'; String spell_correction = highlight; } }"
    );
    ApexParser.CompilationUnitContext context = parserAndCounter
      .getKey()
      .compilationUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }
}
