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
import { QueryContext, StatementContext } from "../ApexParser";
import { createParser } from "./SyntaxErrorCounter";

test("SOQL Query", () => {
  const [parser, errorCounter] = createParser("Select Id from Account");
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
