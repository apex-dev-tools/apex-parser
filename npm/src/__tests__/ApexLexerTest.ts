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
import { CommonTokenStream } from "antlr4";
import { createLexer } from "./SyntaxErrorCounter";

type ExtCommonTokenStream = CommonTokenStream & {
  // This method is present but not available
  // in antlr4 exported ts types (4.13.2)
  getNumberOfOnChannelTokens(): number;
};

test("Lexer generates tokens", () => {
  const [lexer, errorCounter] = createLexer("public class Hello {}", false);
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(6);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity", () => {
  const [lexer, errorCounter] = createLexer("public");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity (upper case)", () => {
  const [lexer, errorCounter] = createLexer("PUBLIC");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Case insensitivity (mixed case)", () => {
  const [lexer, errorCounter] = createLexer("PuBliC");
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});

test("Lexer unicode escapes", () => {
  const [lexer, errorCounter] = createLexer("'Fran\\u00E7ois'", false);
  const tokens = new CommonTokenStream(lexer) as ExtCommonTokenStream;
  expect(tokens.getNumberOfOnChannelTokens()).toBe(2);
  expect(errorCounter.getNumErrors()).toEqual(0);
});
