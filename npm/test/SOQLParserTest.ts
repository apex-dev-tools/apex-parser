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
  QueryContext,
  StatementContext,
  SoqlLiteralContext,
} from "../src/antlr/ApexParser.js";
import { ApexParserBaseVisitor } from "../src/ApexParserFactory.js";
import { BoundExpressionContext } from "../src/antlr/ApexParser.js";
import { createParser } from "./SyntaxErrorCounter.js";

test("SOQL Query", () => {
  const [parser, errorCounter] = createParser("Select Id from Account");
  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("SOQL Where with single data category filter", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Title FROM KnowledgeArticleVersion WHERE PublishStatus='online' WITH DATA CATEGORY Geography__c ABOVE usa__c"
  );
  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("SOQL Where with data category list filter", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Title FROM Question WHERE LastReplyDate > 2005-10-08T01:02:03Z WITH DATA CATEGORY Geography__c AT (usa__c, uk__c)"
  );
  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("SOQL Where with multiple data category filters", () => {
  const [parser, errorCounter] = createParser(
    "SELECT UrlName FROM KnowledgeArticleVersion WHERE PublishStatus='draft' WITH DATA CATEGORY Geography__c AT usa__c AND Product__c ABOVE_OR_BELOW mobile_phones__c"
  );
  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("SOQL Query Using Field function", () => {
  const [parser, errorCounter] = createParser(
    "Select Fields(All) from Account"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("CurrencyLiteral", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Account WHERE Amount > USD100.01 AND Amount < USD200"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("IdentifiersThatCouldBeCurrencyLiterals", () => {
  const [parser, errorCounter] = createParser("USD100.name = 'name';");

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("DateTimeLiteral", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Name, (SELECT Id FROM Account WHERE createdDate > 2020-01-01T12:00:00Z) FROM Opportunity"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testNegativeNumericLiteral", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Name FROM Opportunity WHERE Value = -100.123"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testLastQuarterKeyword", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Account WHERE DueDate = LAST_QUARTER"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testDistanceFunction", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id, Distance(Address, :something, 'km') FROM Account WHERE Distance(Address, :something, 'km') < 10 ORDER BY Distance(Address, :something, 'km')"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testGeoLocationFunction", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Account WHERE Distance(Address, GeoLocation(:something, -23.33), 'km') < 10"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("SubQuery", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Name, (SELECT Id, (SELECT Id, (SELECT Id, (SELECT Id FROM Child4 ) FROM Child3 ) FROM Child2 ) FROM Child1) FROM Parent"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Grouping function", () => {
  const [parser, errorCounter] = createParser(
    `SELECT
     OBJ1__c O1,
     OBJ2__c O2,
     OBJ3__c O3,
     SUM(OBJ4__c) O4,
     GROUPING(OBJ1__c) O1Group,
     GROUPING(OBJ2__c) O2Group,
     GROUPING(OBJ3__c) O3Group
   FROM OBJ4__c
   GROUP BY ROLLUP(OBJ1__c, OBJ2__c, OBJ3__c)`
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Convert Currency function", () => {
  const [parser, errorCounter] = createParser(
    "[ SELECT convertCurrency(Amount) FROM Opportunity ]"
  );
  const context = parser.soqlLiteral();

  expect(context).toBeInstanceOf(SoqlLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Convert Currency with format", () => {
  const [parser, errorCounter] = createParser(
    `[
            SELECT Amount, FORMAT(amount) Amt, convertCurrency(amount) convertedAmount,
                FORMAT(convertCurrency(amount)) convertedCurrency
            FROM Opportunity where id = '006R00000024gDtIAI'
        ]`
  );
  const context = parser.soqlLiteral();

  expect(context).toBeInstanceOf(SoqlLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Format function with aggregate", () => {
  const [parser, errorCounter] = createParser(
    "[ SELECT FORMAT(MIN(closedate)) Amt FROM opportunity ]"
  );
  const context = parser.soqlLiteral();

  expect(context).toBeInstanceOf(SoqlLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Time Literal", () => {
  const [parser, errorCounter] = createParser(
    "[SELECT Break__c,Check_Out__c FROM VMS_Time_Card_Item__c WHERE Time_Card__c =:timeCard.Id AND Check_Out__c = 01:00:00.000Z]"
  );
  const context = parser.soqlLiteral();

  expect(context).toBeInstanceOf(SoqlLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("rollupWithSoqlFunction", () => {
  const [parser, errorCounter] = createParser(
    `[
    SELECT
        ExternalId__c,
        CALENDAR_YEAR(CustomDateField__c) year,
        SUM(CustomAmountField__c) amount,
        COUNT(Id) counter
    FROM CustomObject__c
    GROUP BY ROLLUP(
        CALENDAR_YEAR(CustomDateField__c),
        ExternalId__c
    )
    ORDER BY
        ExternalId__c ASC NULLS FIRST,
        CALENDAR_YEAR(CustomDateField__c) ASC NULLS LAST
    LIMIT 2000
    ]`
  );
  const context = parser.soqlLiteral();

  expect(context).toBeInstanceOf(SoqlLiteralContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testFormulaFunction", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Account WHERE FORMULA('EndDate - StartDate') > 10"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testFormulaFunctionWithStringComparison", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Account WHERE FORMULA('TRIM(name, 4)') = 'Acme'"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testFormulaFunctionWithEscapedQuotes", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Id FROM Contact WHERE FORMULA('FirstName & \" O\\'Brian\"') = 'Colleen O\\'Brian'"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testFormulaFunctionNotAllowedInHaving", () => {
  const [parser, errorCounter] = createParser(
    "SELECT Name FROM Account GROUP BY Name HAVING FORMULA('1+1') = 2"
  );

  const context = parser.query();

  expect(context).toBeInstanceOf(QueryContext);
  expect(errorCounter.getNumErrors()).toBeGreaterThan(0);
});

// SET OPTIONS examples are standalone/dynamic SOQL, not inline Apex.
test.each([
  "SELECT Id, Name FROM MyDLO__dlm WHERE Status__c = 'Active' SET OPTIONS (dataspace = 'default', honorEmptyStrings = true)",
  "SELECT AccountId__c, Email__c FROM CustomerProfile__dlm SET OPTIONS (dataspace = 'default')",
  "SELECT Id, EmailOptIn__c FROM ContactDLO__dlm WHERE EmailOptIn__c = '' SET OPTIONS (dataspace = 'default', honorEmptyStrings = false)",
  "SELECT Id FROM SimpleDMO__dlm SET OPTIONS (honorEmptyStrings = true)",
  "SELECT Id FROM SimpleDMO__dlm SET OPTIONS (honorEmptyStrings = false)",
  "SELECT Id FROM MyDLO__dlm ORDER BY Id LIMIT 10 OFFSET 1 SET OPTIONS (honorEmptyStrings = true, dataspace = 'default')",
  "select Id from MyDLO__dlm set options (DATASPACE = 'default', HONOREMPTYSTRINGS = TRUE)",
  "SELECT Id, Name, Age__c, ExPackageNS__Age__c FROM Account SET OPTIONS :opts",
  "SELECT Id FROM Account WHERE Name = :name WITH USER_MODE ORDER BY Id LIMIT 10 OFFSET 1 FOR VIEW UPDATE TRACKING SET OPTIONS :opts",
])("SET OPTIONS accepts %s", source => {
  const [parser, errors] = createParser(source);
  const context = parser.query();
  expect(context).toBeInstanceOf(QueryContext);
  expect(context.setOptionsClause()).not.toBeNull();
  expect(errors.getNumErrors()).toBe(0);
  expect(parser.getTokenStream().LA(1)).toBe(-1);
});
test.each([
  "SELECT Id FROM Account SET OPTIONS",
  "SELECT Id FROM Account SET OPTIONS ()",
  "SELECT Id FROM Account SET OPTIONS opts",
  "SELECT Id FROM Account SET OPTIONS :true",
  "SELECT Id FROM Account SET OPTIONS :'package'",
  "SELECT Id FROM Account SET OPTIONS :opts.member",
  "SELECT Id FROM Account SET OPTIONS :opts + 1",
  "SELECT Id FROM Account SET OPTIONS :getOptions()",
  "SELECT Id FROM Account SET OPTIONS :",
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
])("SET OPTIONS rejects %s", source => {
  const [parser, errors] = createParser(source);
  parser.query();
  // query() can parse a prefix; rejection must also check for unconsumed input.
  expect(
    errors.getNumErrors() > 0 || parser.getTokenStream().LA(1) !== -1
  ).toBe(true);
});

test.each(["(dataspace = 'default')", "(honorEmptyStrings = true)"])(
  "SET OPTIONS literals excluded from inline Apex: %s",
  options => {
    const [parser, errors] = createParser(
      `[SELECT Id FROM Account SET OPTIONS ${options}]`
    );
    parser.soqlLiteral();
    expect(errors.getNumErrors()).toBeGreaterThan(0);
  }
);

test("Query options preserve query shape and boundExpression traversal", () => {
  const [parser, errors] = createParser(
    "SELECT Id FROM Account WHERE Name = :name SET OPTIONS :opts"
  );
  const context = parser.query();
  class BindVisitor extends ApexParserBaseVisitor<void> {
    binds: string[] = [];
    visitBoundExpression(ctx: BoundExpressionContext): void {
      this.binds.push(ctx.expression().getText());
    }
  }
  const visitor = new BindVisitor();
  visitor.visit(context);
  expect(visitor.binds).toEqual(["name", "opts"]);
  expect(context.selectList().getText()).toBe("Id");
  expect(context.fromNameList().getText()).toBe("Account");
  expect(
    context.setOptionsClause().boundExpression().expression().getText()
  ).toBe("opts");
  expect(errors.getNumErrors()).toBe(0);
});

test("New option keywords remain Apex and SOQL identifiers", () => {
  const [parser, errors] = createParser(
    "SELECT options, dataspace, honorEmptyStrings FROM Account"
  );
  parser.query();
  expect(errors.getNumErrors()).toBe(0);
  const [apex, apexErrors] = createParser(
    "Integer options = 1; String dataspace = 'default'; Boolean honorEmptyStrings = true; List<Account> records = [SELECT Id FROM Account];"
  );
  apex.anonymousUnit();
  expect(apexErrors.getNumErrors()).toBe(0);
});

test.each(["opts", "holder.get('opts')"])(
  "Live-verified inline query options bind: %s",
  expression => {
    const [parser, errors] = createParser(
      `[SELECT Id FROM Account LIMIT 1 SET OPTIONS :${expression}]`
    );
    const literal = parser.soqlLiteral();
    expect(literal).toBeInstanceOf(SoqlLiteralContext);
    expect(literal.query()).toBeInstanceOf(QueryContext);
    expect(literal.query().fromNameList().getText()).toBe("Account");
    expect(
      literal
        .query()
        .setOptionsClause()
        .boundExpression()
        .expression()
        .getText()
    ).toBe(expression);
    class BindVisitor extends ApexParserBaseVisitor<void> {
      binds: string[] = [];
      visitBoundExpression(ctx: BoundExpressionContext): void {
        this.binds.push(ctx.expression().getText());
      }
    }
    const visitor = new BindVisitor();
    visitor.visit(literal);
    expect(visitor.binds).toEqual([expression]);
    expect(errors.getNumErrors()).toBe(0);
    expect(parser.getTokenStream().LA(1)).toBe(-1);
  }
);

test.each([
  "SELECT COUNT() FROM Account SET OPTIONS :opts",
  "SELECT Name, COUNT(Id) FROM Account GROUP BY Name LIMIT 1 SET OPTIONS :opts",
])("Options retain count/aggregate result-shape nodes: %s", source => {
  const [parser, errors] = createParser(`[${source}]`);
  const query = parser.soqlLiteral().query();
  const grouped = source.includes("GROUP BY");
  const fn = query
    .selectList()
    .selectEntry(grouped ? 1 : 0)
    .soqlFunction();
  expect(fn.COUNT()).not.toBeNull();
  if (grouped) {
    expect(fn.fieldName().getText()).toBe("Id");
    expect(query.groupByClause().getText()).toBe("GROUPBYName");
  } else {
    expect(fn.fieldName()).toBeNull();
    expect(query.groupByClause()).toBeNull();
  }
  expect(query.fromNameList().getText()).toBe("Account");
  expect(errors.getNumErrors()).toBe(0);
});
