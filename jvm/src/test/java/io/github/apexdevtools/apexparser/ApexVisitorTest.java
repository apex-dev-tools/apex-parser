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

import java.io.IOException;
import java.io.StringReader;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.junit.jupiter.api.Test;

public class ApexVisitorTest {

  static class TestVisitor extends ApexParserBaseVisitor<Integer> {

    public Integer methodCount = 0;

    @Override
    public Integer visitMethodDeclaration(
      ApexParser.MethodDeclarationContext ctx
    ) {
      this.methodCount += 1;
      return 1 + super.visitChildren(ctx);
    }

    @Override
    public Integer defaultResult() {
      return 0;
    }
  }

  @Test
  void testVisitorIsVisited() throws IOException {
    ApexLexer lexer = new ApexLexer(
      new CaseInsensitiveInputStream(
        CharStreams.fromString("public class Hello { public void func(){} }")
      )
    );
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    ApexParser parser = new ApexParser(tokens);
    ApexParser.CompilationUnitContext context = parser.compilationUnit();

    TestVisitor visitor = new TestVisitor();
    visitor.visit(context);

    assertEquals(1, visitor.methodCount.intValue());
  }
}
