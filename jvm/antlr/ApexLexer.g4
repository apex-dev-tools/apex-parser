lexer grammar ApexLexer;

@lexer::members {
public void clearCache() {_interp.clearDFA();}
}

import BaseApexLexer;
