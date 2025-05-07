/*
 [The "BSD licence"]
 Copyright (c) 2019 Kevin Jones
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

import { CharStream, CharStreams } from "antlr4";

export class CaseInsensitiveInputStream implements CharStream {
    private src: CharStream;

    get index(): number {
        return this.src.index;
    }

    get size(): number {
        return this.src.size;
    }

    constructor(data: string); // from CharStream
    constructor(data: string, decodeToUnicodeCodePoints: boolean); // from CharStream
    constructor(stream: CharStream);
    constructor(
        data: string | CharStream,
        decodeToUnicodeCodePoints?: boolean
    ) {
        if (typeof data === "string") {
            this.src = CharStreams.fromString(data, decodeToUnicodeCodePoints);
        } else {
            this.src = data;
        }
    }

    reset(): void {
        this.src.reset();
    }

    consume(): void {
        this.src.consume();
    }

    LA(i: number): number {
        return this.toLower(this.src.LA(i));
    }

    LT(offset: number): number {
        // same behaviour as CharStream
        return this.LA(offset);
    }

    mark(): number {
        return this.src.mark();
    }

    release(marker: number): void {
        this.src.release(marker);
    }

    seek(index: number): void {
        return this.src.seek(index);
    }

    getText(start: number, stop: number): string {
        return this.src.getText(start, stop);
    }

    toString(): string {
        return this.src.toString();
    }

    // We only need basic upper to lower conversions
    private toLower(c: number): number {
        if (c >= 65 && c <= 90) {
            return c + 32;
        } else {
            return c;
        }
    }
}
