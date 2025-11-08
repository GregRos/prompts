Summary:
1. Run a subagent to gather context
2. Read the language-specific planning rules
3. Produce the plan as files created in the workspace
4. Await user feedback and restart the process if needed
## 1. Perform research
Run `#tool:runSubagent` tool to execute [[_plan_research.sec]]. Instruct it to work autonomously without pausing for user feedback. It must follow [[_plan_research.sec]] to gather the context required for producing the plan.

This subagent must only execute [[_plan_research.sec]]. It does not have enough information to construct a plan. Discard any plans produced by the subagent.

Continue to (2) while the subagent is executing.
## 2. Read the planning rules
DO NOT use `#tool:runSubagent` for this step.

Run [[_language_specific_planning_rules.sec]] YOURSELF, without a subagent. Make sure you read all the relevant files carefully, as they contain org-wide standards.

IMPORTANT: Your plan will be immediately rejected by the user if you don't perform this step.
## 3. Produce the plan
Wait on the subagent to finish [[_plan_research.sec]]. 

When it finishes, execute [[_produce_plan.sec]] with the information:

1. The results of [[_plan_research.sec]]
2. The [[_language_specific_planning_rules.sec]]
3. Any additional user instructions

DO NOT USE `#tool:runSubagent` for this step.
## 4. Wait for feedback
Wait for the user to review the plan contents.

Once the user replies, restart [[_workflow.sec]] to gather additional context for refining the plan.

Do not start implementation. Any implementation you produce will be discarded.