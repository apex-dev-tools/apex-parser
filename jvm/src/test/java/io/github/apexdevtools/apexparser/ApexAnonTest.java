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
package io.github.apexdevtools.apexparser;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Map;
import org.junit.jupiter.api.Test;

public class ApexAnonTest {

  @Test
  void testEmpty() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      ""
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testStatement() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "System.debug('');"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testField() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "String a; a = '';"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testMethod() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "public void func() {}"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testInterface() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "interface Foo {}"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testClass() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "class Foo {}"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testEnum() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "enum Foo {}"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testProperty() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "String a {get { return a; } set { a = value; }}"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testCombinedSyntax() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "System.debug('');\n" +
      "String a;\n" +
      "a = '';\n" +
      "public void func() {}\n" +
      "interface Foo {}\n" +
      "class FooClass {}\n" +
      "enum FooEnum {}\n" +
      "String b {get { return b; } set { b = value; }}\n"
    );
    ApexParser.AnonymousUnitContext context = parserAndCounter
      .getKey()
      .anonymousUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }
}
