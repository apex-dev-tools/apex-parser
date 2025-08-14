/*
 Copyright (c) 2025 Kevin Jones, Certinia Inc. All rights reserved.
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

import { AnonymousUnitContext } from "../src/antlr/ApexParser.js";
import { createParser } from "./SyntaxErrorCounter.js";

test("Empty file", () => {
  const [parser, errorCounter] = createParser("");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Statement", () => {
  const [parser, errorCounter] = createParser("System.debug('');");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Field", () => {
  const [parser, errorCounter] = createParser("String a; a = '';");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Method", () => {
  const [parser, errorCounter] = createParser("public void func() {}");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Interface", () => {
  const [parser, errorCounter] = createParser("interface Foo {}");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Class", () => {
  const [parser, errorCounter] = createParser("class Foo {}");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Enum", () => {
  const [parser, errorCounter] = createParser("enum Foo {}");
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Property", () => {
  const [parser, errorCounter] = createParser(
    "String a {get { return a; } set { a = value; }}"
  );
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Combined syntax", () => {
  const [parser, errorCounter] = createParser(`
    System.debug('');
    String a;
    a = '';
    public void func() {}
    interface Foo {}
    class FooClass {}
    enum FooEnum {}
    String b {get { return b; } set { b = value; }}
  `);
  const context = parser.anonymousUnit();

  expect(context).toBeInstanceOf(AnonymousUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});
