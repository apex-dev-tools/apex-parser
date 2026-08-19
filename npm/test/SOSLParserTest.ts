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
import {
  CompilationUnitContext,
  SoslLiteralAltContext,
  SoslLiteralContext,
} from "../src/antlr/ApexParser.js";
import { createParser } from "./SyntaxErrorCounter.js";

test("testBasicQuery", () => {
  const [parser, errorCounter] = createParser(
    "[Find 'something' RETURNING Account]"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testEmbeddedQuote", () => {
  const [parser, errorCounter] = createParser(
    "[Find 'some\\'thing' RETURNING Account]"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testBracesFail", () => {
  const [parser, errorCounter] = createParser(
    "[Find {something} RETURNING Account]"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(1);
});

test("testBracesOnAltFormat", () => {
  const [parser, errorCounter] = createParser(
    "[Find {something} RETURNING Account]"
  );

  const context = parser.soslLiteralAlt();

  expect(context).toBeInstanceOf(SoslLiteralAltContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testQuotesFailOnAltFormat", () => {
  const [parser, errorCounter] = createParser(
    "[Find 'something' RETURNING Account]"
  );

  const context = parser.soslLiteralAlt();

  expect(context).toBeInstanceOf(SoslLiteralAltContext);
  expect(errorCounter.getNumErrors()).toEqual(1);
});

test("testWithUserModeQuery", () => {
  const [parser, errorCounter] = createParser(
    "[Find 'something' RETURNING Account WITH USER_MODE WITH METADATA='Labels']"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSystemModeQuery", () => {
  const [parser, errorCounter] = createParser(
    "[Find 'something' RETURNING Account WITH METADATA='Labels' WITH SYSTEM_MODE]"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testToLabel", () => {
  const [parser, errorCounter] = createParser(
    "[FIND :searchTerm IN ALL FIELDS RETURNING Account(Id, toLabel(Name)) LIMIT 10]"
  );

  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testToLabelWithAlias", () => {
  const [parser, errorCounter] = createParser(
    "[FIND :searchTerm IN ALL FIELDS RETURNING Account(Id, toLabel(Name) AliasName) LIMIT 10]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testConvertCurrency", () => {
  const [parser, errorCounter] = createParser(
    `[
            FIND 'test' RETURNING Opportunity(
                Name,
                convertCurrency(Amount),
                convertCurrency(Amount) AliasCurrency
            )
        ]`
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testConvertCurrencyWithFormat", () => {
  const [parser, errorCounter] = createParser(
    `[
            FIND 'Acme' RETURNING Account(
                AnnualRevenue,
                FORMAT(convertCurrency(AnnualRevenue)) convertedCurrency
            )
        ]`
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testFormatWithAggregate", () => {
  const [parser, errorCounter] = createParser(
    "[ FIND 'Acme' RETURNING Account(AnnualRevenue, FORMAT(MIN(CloseDate))) ]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testBindVarInDivisionClause", () => {
  const [parser, errorCounter] = createParser(
    "[FIND :q IN ALL FIELDS RETURNING Account WITH DIVISION = :d LIMIT :l]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSpellCorrection", () => {
  // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_spell_correction.htm
  const [parser, errorCounter] = createParser(
    "[FIND 'San Francisco' IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = false]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSpellCorrectionTrue", () => {
  const [parser, errorCounter] = createParser(
    "[FIND :searchTerm IN ALL FIELDS RETURNING Contact(Id, FirstName, LastName) WITH SPELL_CORRECTION = true]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSpellCorrectionOnAltFormat", () => {
  const [parser, errorCounter] = createParser(
    "[FIND {San Francisco} IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = false]"
  );
  const context = parser.soslLiteralAlt();

  expect(context).toBeInstanceOf(SoslLiteralAltContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testBindVarInSpellCorrectionClause", () => {
  const [parser, errorCounter] = createParser(
    "[FIND :q IN ALL FIELDS RETURNING Account WITH SPELL_CORRECTION = :correct]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithHighlight", () => {
  // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_highlight.htm
  const [parser, errorCounter] = createParser(
    "[FIND 'salesforce' IN ALL FIELDS RETURNING Account(Name,Description) WITH HIGHLIGHT]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithHighlightOnCustomObject", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Salesforce West' IN ALL FIELDS RETURNING Building__c(Name, BuildingDescription__c) WITH HIGHLIGHT]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithHighlightAndSpellCorrection", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'salesforce' IN ALL FIELDS RETURNING Account(Name) WITH HIGHLIGHT WITH SPELL_CORRECTION = false LIMIT 10]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSnippetTargetLength", () => {
  // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_snippet.htm
  const [parser, errorCounter] = createParser(
    "[FIND 'San Francisco' IN ALL FIELDS RETURNING KnowledgeArticleVersion(id, title WHERE PublishStatus = 'Online' AND Language = 'en_US') WITH SNIPPET (target_length=120)]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithSnippetNoTargetLength", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'San Francisco' IN ALL FIELDS RETURNING FeedItem, FeedComment WITH SNIPPET]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithNetworkEquals", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING User(Id, Name) WITH NETWORK = '0DBxx0000000123']"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithNetworkIn", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING User(Id, Name) WITH NETWORK IN ('0DBxx0000000123', '0DBxx0000000456')]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithPricebookId", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'laptop' RETURNING Product2(Id, Name WHERE ProductCode = 'ABC-123') WITH PricebookId = '01sxx0000002MffAAE']"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithMetadataLabels", () => {
  // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_with_metadata.htm
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING Account(Id, Name) WITH METADATA='LABELS']"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithDivision", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING Account(Id, Name) WITH DIVISION = 'Global']"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithDataCategory", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING KnowledgeArticleVersion(Id, Title) WITH DATA CATEGORY Location__c AT America__c AND Product__c ABOVE_OR_BELOW mobile_phones__c]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWithDataCategoryList", () => {
  const [parser, errorCounter] = createParser(
    "[FIND 'Acme' RETURNING KnowledgeArticleVersion(Id, Title) WITH DATA CATEGORY Geography__c AT (usa__c, uk__c)]"
  );
  const context = parser.soslLiteral();

  expect(context).toBeInstanceOf(SoslLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testHighlightAsIdentifier", () => {
  const [parser, errorCounter] = createParser(
    "public class Dummy { void f() { String highlight = 'a'; String spell_correction = highlight; } }"
  );
  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});
