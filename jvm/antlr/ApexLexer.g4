lexer grammar ApexLexer;
options { caseInsensitive = true; }

@lexer::members {
public void clearCache() { _interp.clearDFA(); }
}

import BaseApexLexer;
