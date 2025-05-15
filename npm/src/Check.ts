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

import { readdir } from "node:fs/promises";
import { readdirSync, readFileSync, lstatSync, existsSync } from "node:fs";
import { basename, dirname, extname, resolve, relative, join } from "node:path";
import ApexParser from "./antlr/ApexParser";
import { ApexErrorListener } from "./ApexErrorListener";
import { ApexParserFactory } from "./ApexParserFactory";

export interface CheckError {
  column: number;
  line: number;
  message: string;
  path: string;
}

export interface CheckResult {
  errors: CheckError[];
  status: number;
}

export interface ProjectCheckResult extends CheckResult {
  name: string;
  path: string;
  pkg?: string;
}

/**
 * Check Apex files in a path for syntax errors.
 *
 * @param pathStr Path to check. If not provided, uses process.argv or
 * process.cwd().
 * @returns Result with status (0 ok, 1 error, 2 missing path) and syntax
 * errors.
 */
export async function check(pathStr?: string): Promise<CheckResult> {
  const path = resolve(pathStr || process.argv[1] || process.cwd());

  const result: CheckResult = {
    status: 0,
    errors: [],
  };

  if (!existsSync(path)) {
    console.log(`Path does not exist, aborting: ${path}`);
    result.status = 2;
  } else {
    try {
      result.errors = await parseFiles(path);
    } catch (err) {
      console.log(`Error processing: ${path}`);
      console.log(err);
      result.status = 1;
    }
  }

  process.exitCode = result.status;
  return result;
}

/**
 * Check an Apex sfdx-project for syntax errors.
 *
 * @param pathStr Path to directory containing an sfdx-project.json at most 1
 * level deep. If not found, reverts to `check()` behaviour.
 * @returns Result for each package with status (0 ok, 1 error, 2 missing path)
 * and syntax errors.
 */
export async function checkProject(
  pathStr?: string
): Promise<ProjectCheckResult[]> {
  const path = resolve(pathStr || process.argv[1] || process.cwd());
  const name = basename(path);
  const project = findProjectFile(path, 1);
  const packages = getProjectPackages(project);

  if (packages.length == 0) {
    console.log(
      `[${name}]: No valid SFDX project, checking all cls & trigger files`
    );
    const result = await check(path);
    return [
      {
        name,
        path: ".",
        ...result,
      },
    ];
  }

  const projectDir = dirname(project);
  const projectResult = await Promise.all(
    packages.map(async pkg => {
      console.log(`[${name}]: Checking package "${pkg}"`);
      const pkgPath = resolve(projectDir, pkg);
      const result = await check(pkgPath);
      return {
        name,
        pkg,
        path: relative(path, pkgPath),
        ...result,
      };
    })
  );

  process.exitCode = Math.max(...projectResult.map(r => r.status));
  return projectResult;
}

class CheckErrorListener extends ApexErrorListener {
  private file: string;
  private errors: CheckError[] = [];

  constructor(relativePath: string) {
    super();
    this.file = relativePath;
  }

  apexSyntaxError(line: number, column: number, message: string): void {
    const error: CheckError = {
      column,
      line,
      message,
      path: this.file,
    };

    // to stderr for filtering if needed
    console.error(JSON.stringify(error));
    this.errors.push(error);
  }

  getErrors(): CheckError[] {
    return this.errors;
  }
}

async function parseFiles(path: string): Promise<CheckError[]> {
  const ext = [".cls", ".trigger"];
  const files = await getPathsInDir(path, ext);
  const classErrors = parseByType(path, files, ext[0], (parser: ApexParser) => {
    parser.compilationUnit();
  });
  const triggerErrors = parseByType(
    path,
    files,
    ext[1],
    (parser: ApexParser) => {
      parser.triggerUnit();
    }
  );
  return classErrors.concat(triggerErrors);
}

async function getPathsInDir(path: string, ext: string[]): Promise<string[]> {
  const dirent = await readdir(path, {
    withFileTypes: true,
    recursive: true,
  });

  return dirent.reduce<string[]>((files, ent) => {
    if (ent.isFile() && ext.includes(extname(ent.name))) {
      files.push(join(ent.parentPath, ent.name));
    }
    return files;
  }, []);
}

function parseByType(
  rootPath: string,
  files: string[],
  endsWith: string,
  operation: (parser: ApexParser) => void
): CheckError[] {
  let parsedCount = 0;
  const errors: CheckError[] = [];
  files
    .filter(name => name.endsWith(endsWith))
    .forEach(file => {
      if (lstatSync(file).isFile()) {
        const parser = ApexParserFactory.createParser(
          readFileSync(file).toString()
        );
        const relativePath = relative(rootPath, file);
        const listener = new CheckErrorListener(relativePath);
        parser.addErrorListener(listener);

        operation(parser);

        const fileErrors = listener.getErrors();
        if (fileErrors.length) {
          console.log(
            `Found ${fileErrors.length} syntax errors in: ${relativePath}`
          );
          errors.push(...fileErrors);
        }

        parsedCount += 1;
      }
    });

  console.log(`Parsed ${parsedCount} '${endsWith}' files in: ${rootPath}`);
  return errors;
}

function findProjectFile(wd: string, depth: number): string | undefined {
  const proj = "sfdx-project.json";
  const files = readdirSync(wd).filter(i => !/(^|\/)\.[^/.]/g.test(i));
  if (files.includes(proj)) {
    return resolve(wd, proj);
  }
  if (depth) {
    const dirs = files
      .map(f => resolve(wd, f))
      .filter(f => lstatSync(f).isDirectory());
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
      path?: string;
    }[];
  } = JSON.parse(readFileSync(projectFilePath, { encoding: "utf8" }));
  const packages = config.packageDirectories || [];
  return packages.flatMap(p => (p.path ? p.path.replace(/\\/g, "/") : []));
}
