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
import {
  AnnotationContext,
  ElementValuePairContext,
} from "../src/antlr/ApexParser.js";
import { createParser } from "./SyntaxErrorCounter.js";

/* Parse an annotation as a class modifier. compilationUnit ends in EOF, so the whole annotation
   has to be consumed for this to report no errors. */
function parseTypeAnnotation(annotation: string): AnnotationContext {
  const [parser, errorCounter] = createParser(
    `${annotation} public class Hello {}`
  );
  const context = parser.compilationUnit();

  expect(errorCounter.getNumErrors()).toEqual(0);
  return context.typeDeclaration().modifier(0).annotation();
}

function typeAnnotationErrors(annotation: string): number {
  const [parser, errorCounter] = createParser(
    `${annotation} public class Hello {}`
  );
  parser.compilationUnit();
  return errorCounter.getNumErrors();
}

function memberAnnotationErrors(annotation: string): number {
  const [parser, errorCounter] = createParser(
    `public class Hello { ${annotation} public void func() {} }`
  );
  parser.compilationUnit();
  return errorCounter.getNumErrors();
}

function pairs(annotation: string): ElementValuePairContext[] {
  const pairs = parseTypeAnnotation(annotation).elementValuePairs();
  expect(pairs).toBeTruthy();
  return pairs.elementValuePair_list();
}

function valueOf(pair: ElementValuePairContext): string {
  return pair.elementValue().literal().getText();
}

test("No parameters", () => {
  const context = parseTypeAnnotation("@AuraEnabled");

  expect(context.id().getText()).toBe("AuraEnabled");
  expect(context.LPAREN()).toBeNull();
  expect(context.elementValuePairs()).toBeNull();
  expect(context.elementValue()).toBeNull();
});

test("Empty parameters", () => {
  const context = parseTypeAnnotation("@AuraEnabled()");

  expect(context.id().getText()).toBe("AuraEnabled");
  expect(context.LPAREN()).toBeTruthy();
  expect(context.elementValuePairs()).toBeNull();
  expect(context.elementValue()).toBeNull();
});

test("Single unnamed value", () => {
  const context = parseTypeAnnotation("@SuppressWarnings('PMD')");

  expect(context.id().getText()).toBe("SuppressWarnings");
  expect(context.elementValuePairs()).toBeNull();
  expect(context.elementValue().literal().getText()).toBe("'PMD'");
});

test("Single named value", () => {
  const params = pairs("@SuppressWarnings(value='PMD')");

  expect(params.length).toBe(1);
  expect(params[0].id().getText()).toBe("value");
  expect(valueOf(params[0])).toBe("'PMD'");
});

test("Space separated pairs", () => {
  const params = pairs("@IsTest(SeeAllData=true IsParallel=false)");

  expect(params.length).toBe(2);
  expect(params[0].id().getText()).toBe("SeeAllData");
  expect(valueOf(params[0])).toBe("true");
  expect(params[1].id().getText()).toBe("IsParallel");
  expect(valueOf(params[1])).toBe("false");
});

// The platform separates parameters by whitespace alone and rejects the comma form. It is
// accepted here deliberately, see the comment on elementValuePairs in BaseApexParser.g4.
test("Comma separated pairs are accepted", () => {
  const params = pairs("@IsTest(SeeAllData=true, IsParallel=false)");

  expect(params.length).toBe(2);
  expect(params[0].id().getText()).toBe("SeeAllData");
  expect(params[1].id().getText()).toBe("IsParallel");
});

test("Comma separated pairs are accepted on a member", () => {
  expect(
    memberAnnotationErrors("@IsTest(SeeAllData=true, IsParallel=false)")
  ).toEqual(0);
});

test("Trailing comma is rejected", () => {
  expect(typeAnnotationErrors("@IsTest(SeeAllData=true,)")).toEqual(1);
});

test("Quoted value containing commas", () => {
  const context = parseTypeAnnotation("@SuppressWarnings('PMD,Unused')");

  expect(context.elementValue().literal().getText()).toBe("'PMD,Unused'");
});

test("Quoted value containing spaces", () => {
  const params = pairs(
    "@InvocableMethod(label='Do a thing' category='Some, category')"
  );

  expect(params.length).toBe(2);
  expect(valueOf(params[0])).toBe("'Do a thing'");
  expect(valueOf(params[1])).toBe("'Some, category'");
});

test("String literal value", () => {
  const literal = pairs("@InvocableMethod(label='x')")[0]
    .elementValue()
    .literal();

  expect(literal.StringLiteral()).toBeTruthy();
});

test("Multiline string literal value", () => {
  const literal = pairs("@InvocableMethod(label='''\nx''')")[0]
    .elementValue()
    .literal();

  expect(literal.MultilineStringLiteral()).toBeTruthy();
});

test("Boolean literal value", () => {
  const literal = pairs("@AuraEnabled(cacheable=true)")[0]
    .elementValue()
    .literal();

  expect(literal.BooleanLiteral()).toBeTruthy();
});

test("Integer literal value", () => {
  const literal = pairs("@InvocableMethod(label=42)")[0]
    .elementValue()
    .literal();

  expect(literal.IntegerLiteral()).toBeTruthy();
});

test("Long literal value", () => {
  const literal = pairs("@InvocableMethod(label=42L)")[0]
    .elementValue()
    .literal();

  expect(literal.LongLiteral()).toBeTruthy();
});

test("Number literal value", () => {
  const literal = pairs("@InvocableMethod(label=4.2)")[0]
    .elementValue()
    .literal();

  expect(literal.NumberLiteral()).toBeTruthy();
});

test("Null literal value", () => {
  const literal = pairs("@AuraEnabled(cacheable=null)")[0]
    .elementValue()
    .literal();

  expect(literal.NULL()).toBeTruthy();
});

// Values the platform rejects still parse, so that apex-ls can diagnose them precisely rather
// than the file being lost to a syntax error. See apex-ls#326.
test("Type mismatched value still parses", () => {
  expect(typeAnnotationErrors("@AuraEnabled(cacheable=0)")).toEqual(0);
  expect(typeAnnotationErrors("@AuraEnabled(cacheable=null)")).toEqual(0);
  expect(typeAnnotationErrors("@InvocableMethod(label=42)")).toEqual(0);
});

test("Qualified name is rejected", () => {
  expect(typeAnnotationErrors("@Schema.AuraEnabled")).toBeGreaterThan(0);
  expect(memberAnnotationErrors("@Schema.AuraEnabled")).toBeGreaterThan(0);
});

test("Array initializer value is rejected", () => {
  expect(
    typeAnnotationErrors("@InvocableMethod(label={'a','b'})")
  ).toBeGreaterThan(0);
  expect(
    memberAnnotationErrors("@InvocableMethod(label={'a','b'})")
  ).toBeGreaterThan(0);
});

test("Nested annotation value is rejected", () => {
  expect(
    typeAnnotationErrors("@InvocableMethod(label=@IsTest)")
  ).toBeGreaterThan(0);
  expect(
    memberAnnotationErrors("@InvocableMethod(label=@IsTest)")
  ).toBeGreaterThan(0);
});

test("Bare identifier value is rejected", () => {
  expect(typeAnnotationErrors("@AuraEnabled(cacheable=foo)")).toBeGreaterThan(
    0
  );
  expect(memberAnnotationErrors("@AuraEnabled(cacheable=foo)")).toBeGreaterThan(
    0
  );
});

test("Bare identifier unnamed value is rejected", () => {
  expect(typeAnnotationErrors("@SuppressWarnings(PMD)")).toBeGreaterThan(0);
  expect(memberAnnotationErrors("@SuppressWarnings(PMD)")).toBeGreaterThan(0);
});

test("Expression value is rejected", () => {
  expect(
    typeAnnotationErrors("@InvocableMethod(label='a' + 'b')")
  ).toBeGreaterThan(0);
  expect(
    memberAnnotationErrors("@InvocableMethod(label='a' + 'b')")
  ).toBeGreaterThan(0);
});
