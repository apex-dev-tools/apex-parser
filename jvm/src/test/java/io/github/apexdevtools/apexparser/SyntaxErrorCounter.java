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

import java.util.AbstractMap;
import java.util.Map;
import org.antlr.v4.runtime.*;

public class SyntaxErrorCounter extends BaseErrorListener {

  private int numErrors = 0;

  @Override
  public void syntaxError(
    Recognizer<?, ?> recognizer,
    Object offendingSymbol,
    int line,
    int charPositionInLine,
    String msg,
    RecognitionException e
  ) {
    this.numErrors += 1;
  }

  public int getNumErrors() {
    return this.numErrors;
  }

  public static Map.Entry<ApexLexer, SyntaxErrorCounter> createLexer(
    String input
  ) {
    ApexLexer lexer = ApexParserFactory.createLexer(
      CharStreams.fromString(input)
    );
    SyntaxErrorCounter errorCounter = new SyntaxErrorCounter();
    lexer.addErrorListener(errorCounter);

    return new AbstractMap.SimpleEntry<>(lexer, errorCounter);
  }

  public static Map.Entry<ApexParser, SyntaxErrorCounter> createParser(
    String input
  ) {
    ApexParser parser = ApexParserFactory.createParser(
      CharStreams.fromString(input)
    );
    SyntaxErrorCounter errorCounter = new SyntaxErrorCounter();
    parser.addErrorListener(errorCounter);

    return new AbstractMap.SimpleEntry<>(parser, errorCounter);
  }
}
