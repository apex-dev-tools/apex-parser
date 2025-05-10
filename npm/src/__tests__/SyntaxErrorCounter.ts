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
import {
  ErrorListener,
  CharStreams,
  CommonTokenStream,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import ApexLexer from "../ApexLexer";
import ApexParser from "../ApexParser";
import { CaseInsensitiveInputStream } from "../CaseInsensitiveInputStream";

export class SyntaxErrorCounter<T = Token> extends ErrorListener<T> {
  numErrors = 0;

  syntaxError(
    recognizer: Recognizer<T>,
    offendingSymbol: T,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    this.numErrors += 1;
  }

  getNumErrors(): number {
    return this.numErrors;
  }
}

export function createLexer(
  input: string,
  caseInsensitive: boolean = true
): [ApexLexer, SyntaxErrorCounter<number>] {
  const lexer = new ApexLexer(
    caseInsensitive
      ? new CaseInsensitiveInputStream(input)
      : CharStreams.fromString(input)
  );

  lexer.removeErrorListeners();
  const errorCounter = new SyntaxErrorCounter<number>();
  lexer.addErrorListener(errorCounter);

  return [lexer, errorCounter];
}

export function createParser(input: string): [ApexParser, SyntaxErrorCounter] {
  const lexer = new ApexLexer(new CaseInsensitiveInputStream(input));
  const tokens = new CommonTokenStream(lexer);
  const parser = new ApexParser(tokens);

  parser.removeErrorListeners();
  const errorCounter = new SyntaxErrorCounter();
  parser.addErrorListener(errorCounter);

  return [parser, errorCounter];
}
