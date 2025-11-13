---
argument-hint: "{ language = ts, mode = plan/impl }"
description: Attach coding standards.
name: attach-standards
---
YOU MUST ALWAYS FOLLOW the org-wide coding standards for all the code you produce. Infer language from context. Use `#tool:search/readFile` to read the appropriate language-specific files.
\<critical_instructions>
\<typescript_instructions>
Read [[rules/ts.rules|rules ts]]
Read [[rules/js.rules|rules js]]
\<plan_instructions>
Read [[agents/plan.agent/code.rules|agent plan rules code]]
Read [[agents/plan.agent/ts.rules|agent plan rules ts]]
Read [[agents/plan.agent/js.rules|agent plan rules js]]
\</mode_instructions>
\<mode_instructions mode=impl>
Read [[agents/impl.agent/code.rules|agent impl rules code]]
Read [[agents/impl.agent/ts.rules|agent impl rules ts]]
Read [[agents/impl.agent/js.rules|agent impl rules js]]
\</mode_instructions>
\</language_instructions>
\<language_instructions language=python>
Read [[rules/py.rules|rules py]]
\<mode_instructions mode=plan>
Read [[agents/plan.agent/code.rules|agent plan rules code]]
Read [[agents/plan.agent/py.rules|agent plan rules py]]
\</mode_instructions>
\<mode_instructions mode=impl>
Read [[agents/impl.agent/code.rules|agent impl rules code]]
Read [[agents/impl.agent/py.rules|agent impl rules py]]
\</mode_instructions>
\</language_instructions>
\</critical_instructions