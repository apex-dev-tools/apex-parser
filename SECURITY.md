# Security Policy

## Reporting a vulnerability

Please do not report security issues through public GitHub issues, discussions or pull requests.

Report them privately through GitHub's [private vulnerability reporting](https://github.com/apex-dev-tools/apex-parser/security/advisories/new) instead, which you can also reach from the Security tab of this repository. The report stays visible only to you and the maintainers until a fix is ready and an advisory is published.

It helps to include the affected package (`@apexdevtools/apex-parser` on npm or `io.github.apex-dev-tools:apex-parser` on Maven Central) and version, a description of the impact, and a minimal input or steps that reproduce the problem.

This project is maintained by a small team, so we can't promise fixed response times, but we aim to acknowledge reports within a week and will keep you updated as we investigate. We are happy to credit reporters in the advisory if you would like that.

## Supported versions

Fixes are made against the latest release and shipped as a new version on both npm and Maven Central. Older major versions do not normally receive security fixes.

| Version | Supported |
| ------- | --------- |
| 5.x     | Yes       |
| < 5.0   | No        |

## Scope

The parser is commonly used on Apex source that the caller does not control, so issues such as input that causes excessive CPU or memory use, or a crash that cannot be caught by the caller, are in scope. So are problems with the published npm and Maven artifacts themselves.

Inputs that are simply parsed differently from the Salesforce platform compiler are bugs rather than vulnerabilities and can be raised as normal issues. Some differences are deliberate and are recorded in [`doc/SalesforceDifferences.md`](doc/SalesforceDifferences.md).
