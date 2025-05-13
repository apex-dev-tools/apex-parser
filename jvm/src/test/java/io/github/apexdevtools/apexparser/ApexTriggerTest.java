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
package io.github.apexdevtools.apexparser;

import static io.github.apexdevtools.apexparser.SyntaxErrorCounter.createParser;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Map;
import org.junit.jupiter.api.Test;

public class ApexTriggerTest {

  @Test
  void testEmptyTrigger() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithStatement() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {System.debug('');}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithMethod() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {public void func() {}}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithField() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {String a;}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithInterface() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {interface Foo {}}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithClass() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {class Foo {}}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithEnum() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) {enum Foo {}}"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }

  @Test
  void testTriggerWithProperty() {
    Map.Entry<ApexParser, SyntaxErrorCounter> parserAndCounter = createParser(
      "trigger test on Account (before update, after update) { String a {get { return a; } set { a = value; }} }"
    );
    ApexParser.TriggerUnitContext context = parserAndCounter
      .getKey()
      .triggerUnit();
    assertNotNull(context);
    assertEquals(0, parserAndCounter.getValue().getNumErrors());
  }
}
