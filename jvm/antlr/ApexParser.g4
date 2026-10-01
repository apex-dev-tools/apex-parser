parser grammar ApexParser;
options { tokenVocab = ApexLexer; }

@parser::members {
public void clearCache() { _interp.clearDFA(); }

private boolean isStandaloneQuery() {
    for (org.antlr.v4.runtime.RuleContext ctx = _ctx; ctx != null; ctx = ctx.parent) {
        if (ctx.getRuleIndex() == RULE_soqlLiteral) return false;
    }
    return true;
}

private boolean isQueryOptionsBind(BoundExpressionContext ctx) {
    return ctx.expression() instanceof PrimaryExpressionContext
        && ((PrimaryExpressionContext) ctx.expression()).primary() instanceof IdPrimaryContext;
}
}

import BaseApexParser;
