/*
 * Copyright (c) 2022 FinancialForce.com, inc. All rights reserved.
 */
import { spawnSync } from "child_process";
import { readdirSync, lstatSync } from "fs";
import { basename, resolve } from "path"
import { checkProject } from "../..";

describe("Parse samples", () => {

    // .each runs first before any hooks like beforeAll
    function getSamples(): string[][] {
        if (!process.env.SAMPLES) {
            throw new Error("Missing environment variable 'SAMPLES' with path to samples.");
        }
        const sampleDir = resolve(process.env.SAMPLES);
        return readdirSync(sampleDir)
            .filter(f => !(/(^|\/)\.[^\/\.]/g).test(f)) // not hidden
            .map(f => resolve(sampleDir, f)) // full path
            .filter(f => lstatSync(f).isDirectory())
            .map(d => [basename(d), d])
    }

    // disable jest wrapped logging
    const jestConsole = console;
    beforeEach(() => {
        global.console = require("console");
    });
    afterEach(() => {
        global.console = jestConsole;
    });

    test.each(getSamples())("Sample: %s", async (_name, path) => {
        const result = await checkProject(path);
        expect(result).toMatchSnapshot();

        // run the jvm version of check over same dirs
        result.forEach(r => {
            const jvmCheck = spawnSync(
                "java",
                [
                    "-cp",
                    "jvm/target/dependency/*:jvm/target/apex-parser.jar",
                    "com.nawforce.apexparser.Check",
                    resolve(path, r.path)
                ],
                {
                    // can only be run from npm dir
                    cwd: resolve(process.cwd(), ".."),
                    timeout: 10000
                }
            );

            const errors: string[] = [];
            const logs: string[] = [];
            // either >1 or null, truthy check not enough
            if (jvmCheck.status || jvmCheck.status == null) {
                logs.push(...jvmCheck.stderr.toString("utf8").split("\n"));
            } else {
                jvmCheck.stdout
                    .toString("utf8")
                    .split("\n")
                    .forEach(l => (l.startsWith("{") ? errors : logs).push(l));
            }

            console.log(logs.filter(l => l).map(s => `(JVM) ${s}`).join("\n"));

            // catch unexpected failures or timeouts
            expect(jvmCheck.status).toEqual(r.status);
            // match syntax errors to snapshot value
            expect(errors.map(j => JSON.parse(j))).toMatchObject(r.errors);
        });

    }, 15000);

});
