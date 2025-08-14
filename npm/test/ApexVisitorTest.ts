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

import { MethodDeclarationContext } from "../src/antlr/ApexParser.js";
import {
  ApexParserFactory,
  ApexParserBaseVisitor,
} from "../src/ApexParserFactory.js";

class TestVisitor extends ApexParserBaseVisitor<number> {
  public methodCount = 0;

  visitMethodDeclaration(ctx: MethodDeclarationContext): number {
    this.methodCount += 1;
    return 1 + this.visitChildren(ctx);
  }

  defaultResult() {
    return 0;
  }
}

test("Visitor is visited", () => {
  const parser = ApexParserFactory.createParser(
    "public class Hello { public void func(){} }",
    true
  );

  const cu = parser.compilationUnit();
  const visitor = new TestVisitor();
  visitor.visit(cu);

  expect(visitor.methodCount).toBe(1);
});
