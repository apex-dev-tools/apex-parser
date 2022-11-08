/*
 [The "BSD licence"]
 Copyright (c) 2020 Kevin Jones
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

import { basename, dirname, resolve, relative } from "path"
import * as dir from "node-dir"
import { ApexLexer } from "./ApexLexer";
import { ApexParser } from "./ApexParser";
import { CaseInsensitiveInputStream } from "./CaseInsensitiveInputStream"
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { ThrowingErrorListener } from "./ThrowingErrorListener";
import { readdirSync, readFileSync, lstatSync, existsSync } from "fs";

export * from "./ApexLexer"
export * from "./ApexParser"
export * from "./CaseInsensitiveInputStream"
export * from "./ThrowingErrorListener"
export * from "./ApexParserListener"
export * from "./ApexParserVisitor"
export { CommonTokenStream } from "antlr4ts"
export { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker"

interface ParseCheckError {
    path: string;
    error: string;
}

interface ProjectCheckResult {
    name: string;
    pkg?: string;
    errors: ParseCheckError[];
}

export async function check(pathStr?: string): Promise<ParseCheckError[]> {
    const path = resolve(pathStr || process.argv[1] || process.cwd());

    if (!existsSync(path)) {
        console.log(`Path does not exist, aborting: ${path}`);
        return [];
    }

    let parsedCount = 0;
    const files = await dir.promiseFiles(path);
    const errors: ParseCheckError[] = [];
    files.filter(name => name.endsWith(".cls")).forEach(file => {
        if (lstatSync(file).isFile()) {
            const content = readFileSync(file);
            const lexer = new ApexLexer(new CaseInsensitiveInputStream(CharStreams.fromString(content.toString())));
            const tokens = new CommonTokenStream(lexer);

            const parser = new ApexParser(tokens);
            parser.removeErrorListeners();
            parser.addErrorListener(new ThrowingErrorListener());
            try {
                parser.compilationUnit();
            } catch (err) {
                console.log(`Error parsing ${file}`);
                console.log(err);
                errors.push({
                    path: relative(path, file),
                    error: JSON.stringify(err)
                });
            }
            parsedCount += 1;
        }
    });
    console.log(`Parsed ${parsedCount} files in: ${path}`);
    return errors;
}

export async function checkProject(pathStr?: string): Promise<ProjectCheckResult[]> {
    const path = resolve(pathStr || process.argv[1] || process.cwd());
    const name = basename(path);
    const project = findProjectFile(path, 1);
    const packages = getProjectPackages(project);

    if (packages.length == 0) {
        console.log(`[${name}]: No valid SFDX project, checking all cls files`);
        return [{
            name,
            errors: await check(path)
        }];
    }

    const projectDir = dirname(project);
    return Promise.all(
        packages
            .map(async (pkg) => {
                console.log(`[${name}]: Checking package "${pkg}"`);
                return {
                    name,
                    pkg,
                    errors: await check(resolve(projectDir, pkg))
                };
            })
    );
}

function findProjectFile(wd: string, depth: number): string | undefined {
    const proj = "sfdx-project.json";
    const files = readdirSync(wd).filter(i => !(/(^|\/)\.[^\/\.]/g).test(i));
    if (files.includes(proj)) {
        return resolve(wd, proj);
    }
    if (depth) {
        const dirs = files.map(f => resolve(wd, f)).filter(f => lstatSync(f).isDirectory())
        const newDepth = depth - 1;
        for (const d of dirs) {
            const p = findProjectFile(d, newDepth);
            if (p) {
                return p;
            }
        }
    }
    return undefined;
}

function getProjectPackages(projectFilePath?: string): string[] {
    if (!projectFilePath) {
        return [];
    }
    const config: {
        packageDirectories?: {
            path?: string
        }[]
    } = JSON.parse(readFileSync(projectFilePath, { encoding: "utf8" }));
    const packages = config.packageDirectories || [];
    return packages.flatMap((p) => p.path ? p.path.replace(/\\/g, "/") : []);
}
