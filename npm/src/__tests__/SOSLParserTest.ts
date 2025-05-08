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
import { SoslLiteralAltContext, SoslLiteralContext } from "../ApexParser";
import { createParser } from "./SyntaxErrorCounter";

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
