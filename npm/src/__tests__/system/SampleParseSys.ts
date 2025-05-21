/*
 * Copyright (c) 2022 FinancialForce.com, inc. All rights reserved.
 */
import { spawnSync } from "child_process";
import { readdirSync, lstatSync } from "fs";
import { basename, resolve, join } from "path";
import { check, checkProject } from "../..";

describe("Parse samples", () => {
  // known samples with .apex
  const anon = new Set([
    "promiseV3",
    "quiz-host-app",
    "apex-rollup",
    "apex-unified-logging",
    "NebulaLogger",
    "ActionPlansV4",
    "apex-recipes",
    "FormulaShare-DX",
    "ApexTestKit",
    "survey-force",
    "rflib",
  ]);

  // .each runs first before any hooks like beforeAll
  function getSamples(): string[][] {
    if (!process.env.SAMPLES) {
      throw new Error(
        "Missing environment variable 'SAMPLES' with path to samples."
      );
    }
    const sampleDir = resolve(process.env.SAMPLES);
    return readdirSync(sampleDir)
      .filter(f => !/(^|\/)\.[^/.]/g.test(f)) // not hidden
      .map(f => resolve(sampleDir, f)) // full path
      .filter(f => lstatSync(f).isDirectory())
      .map(d => [basename(d), d]);
  }

  // disable jest wrapped logging
  const jestConsole = console;
  beforeEach(() => {
    global.console = require("console");
  });
  afterEach(() => {
    global.console = jestConsole;
  });

  test.each(getSamples())(
    "Sample: %s",
    async (name, path) => {
      const result = await checkProject(path);

      // run additional check for known apex scripts
      if (anon.has(name)) {
        const anonResult = await check(path, ".apex");
        result.push({
          name,
          path: ".",
          ...anonResult,
        });
      }

      expect(result).toMatchSnapshot();

      // run the jvm version of check over same dirs
      result.forEach(r => {
        const jvmCheck = spawnSync(
          "java",
          [
            "-cp",
            "jvm/target/dependency/*:jvm/target/apex-parser.jar",
            "io.github.apexdevtools.apexparser.Check",
            resolve(path, r.path),
            r.extensions.join(","),
          ],
          {
            // can only be run from npm dir (use npm run scripts)
            cwd: resolve(process.cwd(), ".."),
            timeout: 10000,
          }
        );

        const stdout: string[] = extractLines(jvmCheck.stdout);
        const checkErrors: string[] = stdout.filter(l => l.startsWith("{"));
        console.log(jvmStr(stdout));

        // either >1 or null, show error logging
        if (jvmCheck.status || jvmCheck.status == null) {
          console.error(jvmStr(extractLines(jvmCheck.stderr)));
        }

        console.log(
          `\n[${join(r.name, r.path)}] complete, JS ${r.status} / JVM ${jvmCheck.status}\n`
        );

        // catch unexpected failures or timeouts
        expect(jvmCheck.status).toEqual(r.status);
        // match syntax errors to snapshot value
        expect(checkErrors.map(j => JSON.parse(j))).toMatchObject(r.errors);
      });
    },
    15000
  );
});

function extractLines(buffer: Buffer): string[] {
  return buffer
    .toString("utf8")
    .split("\n")
    .filter(l => l);
}

function jvmStr(lines: string[]): string {
  return lines.map(s => `(JVM) ${s}`).join("\n");
}
