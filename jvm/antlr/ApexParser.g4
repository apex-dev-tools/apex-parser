parser grammar ApexParser;
options { tokenVocab = ApexLexer; }

@parser::members {
public void clearCache() { _interp.clearDFA(); }
}

import BaseApexParser;
