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
  LiteralContext,
  Arth1ExpressionContext,
  CompilationUnitContext,
  StatementContext,
  TriggerUnitContext,
  QueryContext,
  CoalExpressionContext,
  PrimaryExpressionContext,
  Arth2ExpressionContext,
  LogOrExpressionContext,
} from "../ApexParser";
import {
  ThrowingErrorListener,
  SyntaxException,
} from "../ThrowingErrorListener";
import { createParser } from "./SyntaxErrorCounter";

test("Boolean Literal", () => {
  const [parser, errorCounter] = createParser("true");
  const context = parser.literal();

  expect(errorCounter.getNumErrors()).toEqual(0);
  expect(context).toBeInstanceOf(LiteralContext);
  expect(context.BooleanLiteral()).toBeTruthy();
  expect(context.BooleanLiteral().getText()).toBe("true");
});

test("Expression", () => {
  const [parser, errorCounter] = createParser("a * 5");
  const context = parser.expression();

  expect(errorCounter.getNumErrors()).toEqual(0);
  expect(context).toBeInstanceOf(Arth1ExpressionContext);
  const arthExpression = context as Arth1ExpressionContext;
  expect(arthExpression.expression_list().length).toBe(2);
});

test("Coalesce Expression", () => {
  const [parser, errorCounter] = createParser("a ?? 5");
  const context = parser.expression();

  expect(errorCounter.getNumErrors()).toEqual(0);
  expect(context).toBeInstanceOf(CoalExpressionContext);
  const coalExpression = context as CoalExpressionContext;
  expect(coalExpression.expression_list().length).toBe(2);
});

test("Coalesce Precedence - Arithmetic", () => {
  // Based on the example in release notes / docs
  // should NOT evaluate to (top ?? 100) - (bottom ?? 0) as you want
  //
  // left assoc  =   (top ?? (100 - bottom)) ?? 0
  // right assoc =   top ?? ((100 - bottom) ?? 0)
  const [parser, errorCounter] = createParser("top ?? 100 - bottom ?? 0");
  const context = parser.expression();

  expect(errorCounter.getNumErrors()).toEqual(0);
  expect(context).toBeInstanceOf(CoalExpressionContext);
  const outer = (context as CoalExpressionContext).expression_list();
  expect(outer.length).toBe(2);
  expect(outer[0]).toBeInstanceOf(CoalExpressionContext);

  const inner = (outer[0] as CoalExpressionContext).expression_list(); // top ?? 100 - bottom
  expect(inner.length).toBe(2);
  expect(inner[0]).toBeInstanceOf(PrimaryExpressionContext); // top
  expect(inner[1]).toBeInstanceOf(Arth2ExpressionContext); // 100 - bottom

  expect(outer[1]).toBeInstanceOf(PrimaryExpressionContext); // 0
});

test("Coalesce Precedence - Boolean", () => {
  // This is more nonsense but using a much lower precedence op
  // should NOT evaluate to (a ?? false) || (b ?? false)
  const [parser, errorCounter] = createParser("a ?? false || b ?? false");
  const context = parser.expression();

  expect(errorCounter.getNumErrors()).toEqual(0);
  expect(context).toBeInstanceOf(CoalExpressionContext);
  const outer = (context as CoalExpressionContext).expression_list();
  expect(outer.length).toBe(2);
  expect(outer[0]).toBeInstanceOf(CoalExpressionContext);

  const inner = (outer[0] as CoalExpressionContext).expression_list(); // a ?? false || b
  expect(inner.length).toBe(2);
  expect(inner[0]).toBeInstanceOf(PrimaryExpressionContext); // a
  expect(inner[1]).toBeInstanceOf(LogOrExpressionContext); // false || b

  expect(outer[1]).toBeInstanceOf(PrimaryExpressionContext); // false
});

test("Compilation Unit", () => {
  const [parser, errorCounter] = createParser("public class Hello {}");

  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Compilation Unit (case insensitive)", () => {
  const [parser, errorCounter] = createParser("Public CLASS Hello {}");

  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Compilation Unit (bug test)", () => {
  const [parser, errorCounter] = createParser(`public class Hello {
        public testMethod void func() {
            System.runAs(u) {
            }
        }
    }`);
  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Compilation Unit (inline SOQL)", () => {
  const [parser, errorCounter] = createParser(`public class Hello {
        public void func() {
            List<Account> accounts = [Select Id from Accounts];
        }
    }`);
  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Compilation Unit (throwing errors)", () => {
  const [parser] = createParser("public class Hello {");

  parser.removeErrorListeners();
  parser.addErrorListener(new ThrowingErrorListener());

  try {
    parser.compilationUnit();
    expect(true).toBe(false);
  } catch (ex) {
    expect(ex).toBeInstanceOf(SyntaxException);
  }
});

test("Trigger Unit", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testSemiAllowedAsWhileBody", () => {
  const [parser, errorCounter] = createParser(
    "while (x++ < 10 && !(y-- < 0));"
  );

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testSemiAllowedAsForBody", () => {
  const [parser, errorCounter] = createParser("for(x=0; x<10; x++);");

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testSemiDisallowedAsGeneralStatement", () => {
  const [parser, errorCounter] = createParser("if (x == 3); else { ; }");

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(1);
});

test("testWhenLiteralParens", () => {
  const [parser, errorCounter] = createParser(`
    switch on (x) {
        when 1 { return 1; }
        when ((2)) { return 2; }
        when (3), (4) { return 3; }
     }`);

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testWhenLiteralParens", () => {
  const [parser, errorCounter] = createParser(`
      switch on (x) {
          when 1 { return 1; }
          when ((2)) { return 2; }
          when (3), (4) { return 3; }
       }`);

  const context = parser.statement();

  expect(context).toBeInstanceOf(StatementContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testSoqlModeKeywords", () => {
  const MODES = ["USER_MODE", "SYSTEM_MODE"];
  for (const mode of MODES) {
    const [parser, errorCounter] = createParser(
      `SELECT Id FROM Account WITH ${mode}`
    );
    const context = parser.query();

    expect(context).toBeInstanceOf(QueryContext);
    expect(errorCounter.getNumErrors()).toEqual(0);
  }
});

test("testDmlModeKeywords", () => {
  const MODES = ["USER", "SYSTEM"];
  for (const mode of MODES) {
    const [parser, errorCounter] = createParser(`insert as ${mode} contact;`);
    const context = parser.statement();

    expect(context).toBeInstanceOf(StatementContext);
    expect(errorCounter.getNumErrors()).toEqual(0);
  }
});

test("testDoWhileBlock", () => {
  const [parser, errorCounter] = createParser(
    "public class Hello {{ do { System.debug(''); } while (true); }}"
  );

  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("testDoWhileWithoutBlockFails", () => {
  const [parser, errorCounter] = createParser(
    "public class Hello {{ do System.debug(''); while (true); }}"
  );

  const context = parser.compilationUnit();

  expect(context).toBeInstanceOf(CompilationUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(3);
});
