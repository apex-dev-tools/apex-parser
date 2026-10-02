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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

public class SOQLParserTest {

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
  void testSOQL() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "Select Fields(All) from Account"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testSOQLWhereWithSingleDataCategoryFilter() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Title FROM KnowledgeArticleVersion WHERE PublishStatus='online' WITH DATA CATEGORY Geography__c ABOVE usa__c"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testSOQLWhereWithDataCategoryListFilter() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Title FROM Question WHERE LastReplyDate > 2005-10-08T01:02:03Z WITH DATA CATEGORY Geography__c AT (usa__c, uk__c)"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testSOQLWhereWithMultipleDataCategoryFilters() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT UrlName FROM KnowledgeArticleVersion WHERE PublishStatus='draft' WITH DATA CATEGORY Geography__c AT usa__c AND Product__c ABOVE_OR_BELOW mobile_phones__c"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testCurrencyLiteral() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Id FROM Account WHERE Amount > USD100.01 AND Amount < USD200"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testIdentifiersThatCouldBeCurrencyLiterals() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "USD100.name = 'name';"
    );
    ApexParser.StatementContext context = parserAndCounter.getKey().statement();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testDateTimeLiteral() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Name, (SELECT Id FROM Account WHERE createdDate > 2020-01-01T12:00:00Z) FROM Opportunity"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testNegativeNumericLiteral() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Name FROM Opportunity WHERE Value = -100.123"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testLastQuarterKeyword() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Id FROM Account WHERE DueDate = LAST_QUARTER"
    );
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

  @Test
  void testSubQuery() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Name, (SELECT Id, (SELECT Id, (SELECT Id, (SELECT Id FROM Child4 ) FROM Child3 ) FROM Child2 ) FROM Child1) FROM Parent"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testGroupingFunction() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT\n" +
        "  OBJ1__c O1,\n" +
        "  OBJ2__c O2,\n" +
        "  OBJ3__c O3,\n" +
        "  SUM(OBJ4__c) O4,\n" +
        "  GROUPING(OBJ1__c) O1Group,\n" +
        "  GROUPING(OBJ2__c) O2Group,\n" +
        "  GROUPING(OBJ3__c) O3Group\n" +
        "FROM OBJ4__c\n" +
        "GROUP BY ROLLUP(OBJ1__c, OBJ2__c, OBJ3__c)"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testConvertCurrency() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[ SELECT convertCurrency(Amount) FROM Opportunity ]"
    );
    ApexParser.SoqlLiteralContext context = parserAndCounter
      .getKey()
      .soqlLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testConvertCurrencyWithFormat() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[\n" +
        "SELECT Amount, FORMAT(amount) Amt, convertCurrency(amount) convertedAmount,\n" +
        "    FORMAT(convertCurrency(amount)) convertedCurrency\n" +
        "FROM Opportunity where id = '006R00000024gDtIAI'\n" +
        "]"
    );
    ApexParser.SoqlLiteralContext context = parserAndCounter
      .getKey()
      .soqlLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormatWithAggregate() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[ SELECT FORMAT(MIN(closedate)) Amt FROM opportunity ]"
    );
    ApexParser.SoqlLiteralContext context = parserAndCounter
      .getKey()
      .soqlLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void timeLiteral() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[SELECT Break__c,Check_Out__c FROM VMS_Time_Card_Item__c WHERE Time_Card__c =:timeCard.Id AND Check_Out__c = 01:00:00.000Z]"
    );
    ApexParser.SoqlLiteralContext context = parserAndCounter
      .getKey()
      .soqlLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void rollupWithSoqlFunction() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "[" +
        "SELECT\n" +
        "    ExternalId__c,\n" +
        "    CALENDAR_YEAR(CustomDateField__c) year,\n" +
        "    SUM(CustomAmountField__c) amount,\n" +
        "    COUNT(Id) counter\n" +
        "FROM CustomObject__c\n" +
        "GROUP BY ROLLUP(\n" +
        "    CALENDAR_YEAR(CustomDateField__c),\n" +
        "    ExternalId__c\n" +
        ")\n" +
        "ORDER BY\n" +
        "    ExternalId__c ASC NULLS FIRST,\n" +
        "    CALENDAR_YEAR(CustomDateField__c) ASC NULLS LAST\n" +
        "LIMIT 2000" +
        "]"
    );
    ApexParser.SoqlLiteralContext context = parserAndCounter
      .getKey()
      .soqlLiteral();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormulaFunction() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Id FROM Account WHERE FORMULA('EndDate - StartDate') > 10"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormulaFunctionWithStringComparison() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Id FROM Account WHERE FORMULA('TRIM(name, 4)') = 'Acme'"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormulaFunctionWithEscapedQuotes() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Id FROM Contact WHERE FORMULA('FirstName & \" O\\'Brian\"') = 'Colleen O\\'Brian'"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testFormulaFunctionNotAllowedInHaving() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "SELECT Name FROM Account GROUP BY Name HAVING FORMULA('1+1') = 2"
    );
    ApexParser.QueryContext context = parserAndCounter.getKey().query();
    assertNotNull(context);
    assertTrue(parserAndCounter.getValue().getNumErrors() > 0);
  }

  // SET OPTIONS examples are standalone/dynamic SOQL, not inline Apex.
  @ParameterizedTest
  @ValueSource(
    strings = {
      "SELECT Id, Name FROM MyDLO__dlm WHERE Status__c = 'Active' SET OPTIONS (dataspace = 'default', honorEmptyStrings = true)",
      "SELECT AccountId__c, Email__c FROM CustomerProfile__dlm SET OPTIONS (dataspace = 'default')",
      "SELECT Id, EmailOptIn__c FROM ContactDLO__dlm WHERE EmailOptIn__c = '' SET OPTIONS (dataspace = 'default', honorEmptyStrings = false)",
      "SELECT Id FROM SimpleDMO__dlm SET OPTIONS (honorEmptyStrings = true)",
      "SELECT Id FROM SimpleDMO__dlm SET OPTIONS (honorEmptyStrings = false)",
      "SELECT Id FROM MyDLO__dlm ORDER BY Id LIMIT 10 OFFSET 1 SET OPTIONS (honorEmptyStrings = true, dataspace = 'default')",
      "select Id from MyDLO__dlm set options (DATASPACE = 'default', HONOREMPTYSTRINGS = TRUE)",
      "SELECT Id, Name, Age__c, ExPackageNS__Age__c FROM Account SET OPTIONS :opts",
      "SELECT Id FROM Account WHERE Name = :name WITH USER_MODE ORDER BY Id LIMIT 10 OFFSET 1 FOR VIEW UPDATE TRACKING SET OPTIONS :opts",
    }
  )
  void testSetOptionsAccepted(String source) {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(source);
    ApexParser parser = pair.getKey();
    ApexParser.QueryContext context = parser.query();
    assertNotNull(context.setOptionsClause());
    assertEquals(0, pair.getValue().getNumErrors());
    assertEquals(-1, parser.getTokenStream().LA(1));
  }

  @ParameterizedTest
  @ValueSource(
    strings = {
      "SELECT Id FROM Account SET OPTIONS",
      "SELECT Id FROM Account SET OPTIONS ()",
      "SELECT Id FROM Account SET OPTIONS opts",
      "SELECT Id FROM Account SET OPTIONS :",
      "SELECT Id FROM Account SET OPTIONS :opts +",
      "SELECT Id FROM Account SET OPTIONS :(opts",
      "SELECT Id FROM Account SET OPTIONS :opts.member(",
      "SELECT Id FROM Account SET OPTIONS :opts + 1 LIMIT 1",
      "SELECT Id FROM Account SET OPTIONS (:opts)",
      "SELECT Id FROM Account SET OPTIONS dataspace = 'default'",
      "SELECT Id FROM Account SET OPTIONS (dataspace = true)",
      "SELECT Id FROM Account SET OPTIONS (dataspace = 1)",
      "SELECT Id FROM Account SET OPTIONS (dataspace = :space)",
      "SELECT Id FROM Account SET OPTIONS (honorEmptyStrings = 'true')",
      "SELECT Id FROM Account SET OPTIONS (honorEmptyStrings = 1)",
      "SELECT Id FROM Account SET OPTIONS (honorEmptyStrings = :flag)",
      "SELECT Id FROM Account SET OPTIONS (explicitNamespace = true)",
      "SELECT Id FROM Account SET OPTIONS (explicitNamespace = 'package')",
      "SELECT Id FROM Account SET OPTIONS (explicitNamespace = :packageName)",
      "SELECT Id FROM Account SET OPTIONS (unknown = true)",
      "SELECT Id FROM Account SET OPTIONS (dataspace = 'default',)",
      "SELECT Id FROM Account SET OPTIONS (dataspace = 'default' honorEmptyStrings = true)",
      "SELECT Id SET OPTIONS :opts FROM Account",
      "SELECT Id FROM Account SET OPTIONS :opts WHERE Name = 'Acme'",
      "SELECT Id FROM Account SET OPTIONS :opts ORDER BY Id",
      "SELECT Id FROM Account SET OPTIONS :opts LIMIT 1",
      "SELECT Id FROM Account SET OPTIONS :opts OFFSET 1",
      "SELECT Id FROM Account SET OPTIONS :opts FOR UPDATE",
      "SELECT Id FROM Account SET OPTIONS :opts UPDATE TRACKING",
      "SELECT Id FROM Account SET OPTIONS :opts SET OPTIONS :other",
      "SELECT Id FROM Account SET OPTIONS :opts, dataspace = 'default'",
      "SELECT Id, (SELECT Id FROM Contacts SET OPTIONS :opts) FROM Account",
    }
  )
  void testSetOptionsRejected(String source) {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(source);
    ApexParser parser = pair.getKey();
    parser.query();
    // query() can parse a prefix; also check for unconsumed input.
    assertTrue(
      pair.getValue().getNumErrors() > 0 || parser.getTokenStream().LA(1) != -1
    );
  }

  @ParameterizedTest
  @ValueSource(
    strings = { "(dataspace = 'default')", "(honorEmptyStrings = true)" }
  )
  void testSetOptionsExcludedFromInlineApex(String options) {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
      "[SELECT Id FROM Account SET OPTIONS " + options + "]"
    );
    pair.getKey().soqlLiteral();
    assertTrue(pair.getValue().getNumErrors() > 0);
  }

  @Test
  void testQueryOptionsPreserveShapeAndBindTraversal() {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
      "SELECT Id FROM Account WHERE Name = :name SET OPTIONS :opts"
    );
    ApexParser.QueryContext context = pair.getKey().query();
    List<String> binds = new ArrayList<>();
    new ApexParserBaseVisitor<Void>() {
      @Override
      public Void visitBoundExpression(ApexParser.BoundExpressionContext ctx) {
        binds.add(ctx.expression().getText());
        return null;
      }
    }.visit(context);
    assertEquals(Arrays.asList("name", "opts"), binds);
    assertEquals("Id", context.selectList().getText());
    assertEquals("Account", context.fromNameList().getText());
    assertEquals(
      "opts",
      context.setOptionsClause().boundExpression().expression().getText()
    );
    assertEquals(0, pair.getValue().getNumErrors());
  }

  @Test
  void testOptionKeywordsRemainIdentifiers() {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
      "SELECT options, dataspace, honorEmptyStrings FROM Account"
    );
    pair.getKey().query();
    assertEquals(0, pair.getValue().getNumErrors());
    pair = createParser(
      "Integer options = 1; String dataspace = 'default'; Boolean honorEmptyStrings = true; List<Account> records = [SELECT Id FROM Account];"
    );
    pair.getKey().anonymousUnit();
    assertEquals(0, pair.getValue().getNumErrors());
  }

  @ParameterizedTest
  @ValueSource(strings = { "opts", "holder.get('opts')" })
  void testLiveVerifiedInlineOptionsBind(String expression) {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
      "[SELECT Id FROM Account LIMIT 1 SET OPTIONS :" + expression + "]"
    );
    ApexParser.SoqlLiteralContext literal = pair.getKey().soqlLiteral();
    assertNotNull(literal.query());
    assertEquals("Account", literal.query().fromNameList().getText());
    assertEquals(
      expression,
      literal
        .query()
        .setOptionsClause()
        .boundExpression()
        .expression()
        .getText()
    );
    List<String> binds = new ArrayList<>();
    new ApexParserBaseVisitor<Void>() {
      @Override
      public Void visitBoundExpression(ApexParser.BoundExpressionContext ctx) {
        binds.add(ctx.expression().getText());
        return null;
      }
    }.visit(literal);
    assertEquals(Arrays.asList(expression), binds);
    assertEquals(0, pair.getValue().getNumErrors());
    assertEquals(-1, pair.getKey().getTokenStream().LA(1));
  }

  @ParameterizedTest
  @ValueSource(
    strings = {
      "SELECT COUNT() FROM Account SET OPTIONS :opts",
      "SELECT Name, COUNT(Id) FROM Account GROUP BY Name LIMIT 1 SET OPTIONS :opts",
    }
  )
  void testOptionsRetainCountAndAggregateShape(String source) {
    Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
      "[" + source + "]"
    );
    ApexParser.QueryContext query = pair.getKey().soqlLiteral().query();
    boolean grouped = source.contains("GROUP BY");
    ApexParser.SoqlFunctionContext fn = query
      .selectList()
      .selectEntry(grouped ? 1 : 0)
      .soqlFunction();
    assertNotNull(fn.COUNT());
    if (grouped) {
      assertEquals("Id", fn.fieldName().getText());
      assertEquals("GROUPBYName", query.groupByClause().getText());
    } else {
      assertNull(fn.fieldName());
      assertNull(query.groupByClause());
    }
    assertEquals("Account", query.fromNameList().getText());
    assertEquals(0, pair.getValue().getNumErrors());
  }

  // Parser acceptance does not guarantee QueryOptions type or dynamic SOQL legality.
  @ParameterizedTest
  @ValueSource(
    strings = {
      "(opts)",
      "opts.member",
      "getOptions()",
      "holder.get('opts')",
      "true",
      "'package'",
      "opts + 1",
    }
  )
  void testOptionsUseNormalBoundExpressionSyntaxAndTraversal(
    String expression
  ) {
    for (boolean inline : new boolean[] { false, true }) {
      String source =
        "SELECT Id FROM Account WHERE Name = :name SET OPTIONS :" + expression;
      Map.Entry<ApexParser, SyntaxErrorCounter> pair = createParser(
        inline ? "[" + source + "]" : source
      );
      org.antlr.v4.runtime.ParserRuleContext tree = inline
        ? pair.getKey().soqlLiteral()
        : pair.getKey().query();
      ApexParser.QueryContext query = inline
        ? ((ApexParser.SoqlLiteralContext) tree).query()
        : (ApexParser.QueryContext) tree;
      ApexParser.BoundExpressionContext bind = query
        .setOptionsClause()
        .boundExpression();
      assertNotNull(bind);
      assertEquals(expression.replace(" ", ""), bind.expression().getText());
      List<String> binds = new ArrayList<>();
      new ApexParserBaseVisitor<Void>() {
        @Override
        public Void visitBoundExpression(
          ApexParser.BoundExpressionContext ctx
        ) {
          binds.add(ctx.expression().getText());
          return null;
        }
      }.visit(tree);
      assertEquals(Arrays.asList("name", expression.replace(" ", "")), binds);
      assertEquals(0, pair.getValue().getNumErrors());
      assertEquals(-1, pair.getKey().getTokenStream().LA(1));
    }
  }
}
