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
import { ApexLexer } from "../ApexLexer";
import { CaseInsensitiveInputStream } from "../CaseInsensitiveInputStream"
import { CharStreams, CommonTokenStream } from 'antlr4ts';

test('Lexer generates tokens', () => {
    const lexer = new ApexLexer(CharStreams.fromString("public class Hello {}"));
    const tokens  = new CommonTokenStream(lexer);
    expect(tokens.getNumberOfOnChannelTokens()).toBe(6)
})

test('Case insensitivity', () => {
    const lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("public")));
    const tokens  = new CommonTokenStream(lexer);
    expect(tokens.getNumberOfOnChannelTokens()).toBe(2)
})

test('Case insensitivity (upper case)', () => {
    const lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("PUBLIC")));
    const tokens  = new CommonTokenStream(lexer);
    expect(tokens.getNumberOfOnChannelTokens()).toBe(2)
})

test('Case insensitivity (mixed case)', () => {
    const lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString("PuBliC")));
    const tokens  = new CommonTokenStream(lexer);
    expect(tokens.getNumberOfOnChannelTokens()).toBe(2)
})