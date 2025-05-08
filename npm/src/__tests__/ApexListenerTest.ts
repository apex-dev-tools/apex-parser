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
import ApexLexer from "../ApexLexer";
import ApexParserListener from "../ApexParserListener";
import ApexParser from "../ApexParser";
import { CaseInsensitiveInputStream } from "../CaseInsensitiveInputStream";
import { CommonTokenStream, ParseTreeListener } from "antlr4";
import { ParseTreeWalker } from "antlr4";
import { ThrowingErrorListener } from "../ThrowingErrorListener";

class TestListener extends ParseTreeListener implements ApexParserListener {
    public methodCount = 0;

    enterMethodDeclaration(/* ctx: MethodDeclarationContext */): void {
        this.methodCount += 1;
    }
}

test("Listener Generates Events", () => {
    const lexer = new ApexLexer(
        new CaseInsensitiveInputStream(
            "public class Hello { public void func(){} }"
        )
    );
    const tokens = new CommonTokenStream(lexer);

    const parser = new ApexParser(tokens);

    parser.removeErrorListeners();
    parser.addErrorListener(new ThrowingErrorListener());

    const cu = parser.compilationUnit();
    const listener = new TestListener();
    ParseTreeWalker.DEFAULT.walk(listener, cu);

    expect(listener.methodCount).toBe(1);
});
