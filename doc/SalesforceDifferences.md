# Differences From Salesforce Behaviour

This page records deliberate, known differences between what this grammar accepts
and what the Salesforce platform compiler accepts. These are intentional design
decisions, not defects; they are documented here so the behaviour is not
mistakenly "corrected", and so a parse result that differs from a platform
compile can be understood.

The grammar generally aims to match the platform. A difference is only kept where
accepting or rejecting something the platform does not buys a consumer a better
outcome than matching would — usually because a parse failure costs the whole
file, while a parse success lets a consumer report one targeted problem and carry
on analysing.

Each difference gets its own section below, recording what this grammar does, what
the platform does, why the difference is kept, its practical consequences, and the
API version the platform behaviour was verified on. The list is expected to grow as
differences surface; it does not claim to be complete.

## Annotation Parameter Comma Separator

This grammar accepts a comma between annotation parameters as well as the
whitespace the platform requires, so both of these parse without error:

```apex
@IsTest(SeeAllData=true IsParallel=false)
@IsTest(SeeAllData=true, IsParallel=false)
```

The separator is optional per pair, so a list mixing both forms parses too. A
leading comma, a doubled comma, and a trailing comma do not.

Salesforce separates annotation parameters by whitespace alone and rejects the
comma form outright. There is no version of Apex in which the comma is legal.

The difference is kept because the comma is the mistake developers actually make
here — it is what every other parameter list in the language looks like — and
because the platform compiler's own recovery from it is unusually destructive.
On a member-level annotation, jorje recovers by reading the line as a constructor
declaration, then emits eight or more cascading errors as the rest of the member
fails to fit that reading, and the remainder of the file is lost. Reproducing that
failure mode would mean a consumer reports a cascade of misleading errors instead
of the one real one, and analyses nothing further in the file.

Accepting the comma keeps the parse intact, so a consumer sees the whole file and
can report a single targeted error against the separator itself.

Practical consequences:
- A file using the comma form parses here but fails to deploy. Detecting it is a
  consumer's job, not the grammar's: this repo has no notion of individual
  annotations and does no semantic validation.
- `ElementValuePairsContext` therefore has to be read as a list of pairs that may
  or may not have commas between them. Its `COMMA` accessor reports the commas
  actually written, which is what a consumer needs to locate the error.
- Tooling that treats a successful parse as "this will deploy" will be wrong for
  this one construct.

This behaviour was verified on API 68.0 (Winter '27). Related issues: #146, and
apex-dev-tools/apex-ls#326 for the consumer-side diagnostic.
