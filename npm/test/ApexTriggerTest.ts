/*
 Copyright (c) 2023 Kevin Jones, All rights reserved.
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

import { TriggerUnitContext } from "../src/antlr/ApexParser.js";
import { createParser } from "./SyntaxErrorCounter.js";

test("Empty Trigger", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with statement", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {System.debug('');}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with method", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {public void func() {}}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with field", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {String a;}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with interface", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {interface Foo {}}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with class", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {class Foo {}}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with enum", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) {enum Foo {}}"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Trigger with property", () => {
  const [parser, errorCounter] = createParser(
    "trigger test on Account (before update, after update) { String a {get { return a; } set { a = value; }} }"
  );
  const context = parser.triggerUnit();

  expect(context).toBeInstanceOf(TriggerUnitContext);
  expect(errorCounter.getNumErrors()).toEqual(0);
});
