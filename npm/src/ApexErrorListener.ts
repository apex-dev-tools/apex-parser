/*
 [The "BSD licence"]
 Copyright (c) 2025 Kevin Jones, Certinia Inc.
 All rights reserved.

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

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import { ErrorListener, RecognitionException, Recognizer, Token } from "antlr4";

/**
 * Base `ErrorListener` for Apex parsers.
 *
 * Implement `apexSyntaxError()` to set behaviour.
 */
export abstract class ApexErrorListener extends ErrorListener<Token> {
  abstract apexSyntaxError(line: number, column: number, msg: string): void;

  syntaxError(
    recognizer: Recognizer<Token>,
    offendingSymbol: Token,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    this.apexSyntaxError(line, column, msg);
  }
}

export class ApexSyntaxError extends Error {
  line: number;
  column: number;
  message: string;

  constructor(line: number, column: number, message: string) {
    super(message);

    this.line = line;
    this.column = column;
    this.name = this.constructor.name;
  }
}

/**
 * `ApexErrorListener` that throws an `ApexSyntaxError` on first reported error.
 *
 * Use ThrowingErrorListener.INSTANCE to share across parsers.
 */
export class ThrowingErrorListener extends ApexErrorListener {
  static readonly INSTANCE = new ThrowingErrorListener();

  apexSyntaxError(line: number, column: number, msg: string): void {
    throw new ApexSyntaxError(line, column, msg);
  }
}
