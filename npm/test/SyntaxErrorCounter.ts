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
import ApexLexer from "../src/antlr/ApexLexer.js";
import ApexParser from "../src/antlr/ApexParser.js";
import { ApexErrorListener } from "../src/ApexErrorListener.js";
import { ApexParserFactory } from "../src/ApexParserFactory.js";

export class SyntaxErrorCounter extends ApexErrorListener {
  numErrors = 0;

  apexSyntaxError(line: number, column: number, msg: string): void {
    this.numErrors += 1;
  }

  getNumErrors(): number {
    return this.numErrors;
  }
}

export function createLexer(input: string): [ApexLexer, SyntaxErrorCounter] {
  const lexer = ApexParserFactory.createLexer(input);
  const errorCounter = new SyntaxErrorCounter();
  lexer.addErrorListener(errorCounter);

  return [lexer, errorCounter];
}

export function createParser(input: string): [ApexParser, SyntaxErrorCounter] {
  const parser = ApexParserFactory.createParser(input);
  const errorCounter = new SyntaxErrorCounter();
  parser.addErrorListener(errorCounter);

  return [parser, errorCounter];
}

export function createLexerAndParser(input: string): {
  lexer: ApexLexer;
  parser: ApexParser;
  errorCounter: SyntaxErrorCounter;
} {
  const errorCounter = new SyntaxErrorCounter();
  const { lexer, parser } = ApexParserFactory.createLexerAndParser(
    input,
    errorCounter
  );
  return { lexer, parser, errorCounter };
}
