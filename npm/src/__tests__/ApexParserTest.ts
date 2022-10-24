import {
    LiteralContext, Arth1ExpressionContext, CompilationUnitContext,
    StatementContext, TriggerUnitContext
} from "../ApexParser";
import { ThrowingErrorListener, SyntaxException } from "../ThrowingErrorListener";
import { createParser } from "./SyntaxErrorCounter";

test('Boolean Literal', () => {

    const [parser, errorCounter] = createParser("true")
    const context = parser.literal()

    expect(errorCounter.getNumErrors()).toEqual(0)
    expect(context).toBeInstanceOf(LiteralContext)
    expect(context.BooleanLiteral()).toBeTruthy()
    expect(context.BooleanLiteral().text).toBe("true")
})

test('Expression', () => {
    const [parser, errorCounter] = createParser("a * 5")
    const context = parser.expression()

    expect(errorCounter.getNumErrors()).toEqual(0)
    expect(context).toBeInstanceOf(Arth1ExpressionContext)
    const arthExpression = context as Arth1ExpressionContext
    expect(arthExpression.expression().length).toBe(2)
})

test('Compilation Unit', () => {
    const [parser, errorCounter] = createParser("public class Hello {}")

    const context = parser.compilationUnit()

    expect(context).toBeInstanceOf(CompilationUnitContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('Compilation Unit (case insensitive)', () => {
    const [parser, errorCounter] = createParser("Public CLASS Hello {}")

    const context = parser.compilationUnit()

    expect(context).toBeInstanceOf(CompilationUnitContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('Compilation Unit (bug test)', () => {
    const [parser, errorCounter] = createParser(`public class Hello {
        public testMethod void func() {
            System.runAs(u) {
            }
        }
    }`)
    const context = parser.compilationUnit()

    expect(context).toBeInstanceOf(CompilationUnitContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('Compilation Unit (inline SOQL)', () => {
    const [parser, errorCounter] = createParser(`public class Hello {
        public void func() {
            List<Account> accounts = [Select Id from Accounts];
        }
    }`)
    const context = parser.compilationUnit()

    expect(context).toBeInstanceOf(CompilationUnitContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('Compilation Unit (throwing errors)', () => {
    const [parser] = createParser("public class Hello {")

    parser.removeErrorListeners()
    parser.addErrorListener(new ThrowingErrorListener());

    try {
        parser.compilationUnit()
        expect(true).toBe(false)
    } catch (ex) {
        expect(ex).toBeInstanceOf(SyntaxException)
    }
})

test('Trigger Unit', () => {
    const [parser, errorCounter] = createParser("trigger test on Account (before update, after update) {}")
    const context = parser.triggerUnit()

    expect(context).toBeInstanceOf(TriggerUnitContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('testSemiAllowedAsWhileBody', () => {
    const [parser, errorCounter] = createParser("while (x++ < 10 && !(y-- < 0));")

    const context = parser.statement()

    expect(context).toBeInstanceOf(StatementContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('testSemiAllowedAsForBody', () => {
    const [parser, errorCounter] = createParser("for(x=0; x<10; x++);")

    const context = parser.statement()

    expect(context).toBeInstanceOf(StatementContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})

test('testSemiDisallowedAsGeneralStatement', () => {
    const [parser, errorCounter] = createParser("if (x == 3); else { ; }")

    const context = parser.statement()

    expect(context).toBeInstanceOf(StatementContext)
    expect(errorCounter.getNumErrors()).toEqual(1)
})

test('testWhenLiteralParens', () => {
    const [parser, errorCounter] = createParser(`
    switch on (x) {
        when 1 { return 1; }
        when ((2)) { return 2; }
        when (3), (4) { return 3; }
     }`);

    const context = parser.statement()

    expect(context).toBeInstanceOf(StatementContext)
    expect(errorCounter.getNumErrors()).toEqual(0)
})
