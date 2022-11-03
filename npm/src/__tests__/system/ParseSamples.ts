import { readdirSync, lstatSync } from "fs";
import { basename, resolve } from "path"
import { check, SfdxProjectError, checkProject } from "../..";

describe("Parse samples", () => {

    // .each runs first before any hooks like beforeAll
    function getSamples(): string[][] {
        if (!process.env.SAMPLES) {
            throw new Error("Missing environment variable with path to samples.");
        }
        const sampleDir = resolve(process.env.SAMPLES);
        return readdirSync(sampleDir)
            .filter(f => !(/(^|\/)\.[^\/\.]/g).test(f)) // not hidden
            .map(f => resolve(sampleDir, f)) // full path
            .filter(f => lstatSync(f).isDirectory())
            .map(d => [basename(d), d])
    }

    // Disable jest wrapped logging
    const jestConsole = console;
    beforeEach(() => {
        global.console = require("console");
    });
    afterEach(() => {
        global.console = jestConsole;
    });

    test.each(getSamples())("Sample: %s", async (_name, path) => {
        try {
            const result = await checkProject(path);
            expect(result).toMatchSnapshot();
        } catch (err: unknown) {
            if (err instanceof SfdxProjectError) {
                // Not a valid sfdx project, try to parse full dir
                const errors = await check(path);
                expect(errors).toMatchSnapshot();
                // path + res.pkg + res.errors[0].path = path + check.path
            } else {
                throw err;
            }
        }
    }, 10000);

});
