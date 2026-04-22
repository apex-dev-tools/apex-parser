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
package io.github.apexdevtools.apexparser;

import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CommonTokenStream;

public final class ApexParserFactory {

  private ApexParserFactory() {}

  public static ApexParser createParser(CharStream stream) {
    return createParser(createTokenStream(stream));
  }

  public static ApexParser createParser(CommonTokenStream tokenStream) {
    ApexParser parser = new ApexParser(tokenStream);

    // always remove default console listener
    parser.removeErrorListeners();
    return parser;
  }

  public static CommonTokenStream createTokenStream(CharStream stream) {
    return new CommonTokenStream(createLexer(stream));
  }

  public static ApexLexer createLexer(CharStream stream) {
    ApexLexer lexer = new ApexLexer(stream);

    // always remove default console listener
    lexer.removeErrorListeners();
    return lexer;
  }

  /**
   * Creates a lexer and parser pair with the given error listener attached to
   * both. This is the recommended way to capture all syntax errors when parsing
   * full Apex source - lexer errors (e.g. invalid string escape sequences) are
   * only reported to listeners attached to the lexer, and parser errors are
   * only reported to listeners attached to the parser.
   */
  public static LexerAndParser createLexerAndParser(
    CharStream stream,
    ApexErrorListener errorListener
  ) {
    ApexLexer lexer = createLexer(stream);
    lexer.addErrorListener(errorListener);
    ApexParser parser = createParser(new CommonTokenStream(lexer));
    parser.addErrorListener(errorListener);
    return new LexerAndParser(lexer, parser);
  }

  /** Holder for a paired {@link ApexLexer} and {@link ApexParser}. */
  public static final class LexerAndParser {

    private final ApexLexer lexer;
    private final ApexParser parser;

    LexerAndParser(ApexLexer lexer, ApexParser parser) {
      this.lexer = lexer;
      this.parser = parser;
    }

    public ApexLexer getLexer() {
      return lexer;
    }

    public ApexParser getParser() {
      return parser;
    }
  }
}
