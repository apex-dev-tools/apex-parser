parser grammar ApexParser;
options { tokenVocab = ApexLexer; }

@parser::members {
private isStandaloneQuery(): boolean {
    for (let ctx: ParserRuleContext | null | undefined = this._ctx; ctx != null; ctx = ctx.parentCtx) {
        if (ctx instanceof SoqlLiteralContext) return false;
    }
    return true;
}
}

import BaseApexParser;
