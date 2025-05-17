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

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.tree.ParseTreeWalker;
import org.junit.jupiter.api.Test;

public class ApexListenerTest {

  static class TestListener extends ApexParserBaseListener {

    public Integer methodCount = 0;

    @Override
    public void enterMethodDeclaration(
      ApexParser.MethodDeclarationContext ctx
    ) {
      this.methodCount += 1;
    }
  }

  @Test
  void testListenerGeneratesEvents() {
    ApexParser parser = ApexParserFactory.createParser(
      CharStreams.fromString("public class Hello { public void func(){} }")
    );
    ApexParser.CompilationUnitContext context = parser.compilationUnit();

    TestListener listener = new TestListener();
    ParseTreeWalker.DEFAULT.walk(listener, context);

    assertEquals(1, listener.methodCount.intValue());
  }
}
