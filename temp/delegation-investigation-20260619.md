# Delegation Investigation — 2026-06-19

## Symptom
`delegate_task(...)` fails in this Hermes session with:
- `_install_delegate_runtime_patch.<locals>.patched_delegate_task() got an unexpected keyword argument 'background'`

## Root cause
A local Hermes plugin is monkey-patching `delegate_task` with an outdated wrapper signature that predates async/background delegation support.

## Evidence
### 1) Plugin is enabled globally
File: `C:\Users\Tiger\AppData\Local\hermes\config.yaml`
- `plugins.enabled` includes `delegate-profile-contract`

### 2) Plugin wrapper omits `background`
File: `C:\Users\Tiger\AppData\Local\hermes\plugins\delegate-profile-contract\__init__.py`
- `_install_delegate_runtime_patch()` replaces `delegate_module.delegate_task`
- `patched_delegate_task(...)` accepts:
  - `goal, context, profile, toolsets, tasks, max_iterations, acp_command, acp_args, role, parent_agent`
- It does **not** accept `background`
- It calls `original_delegate_task(...)` without passing `background`

### 3) Core Hermes delegate_task now supports `background`
File: `C:\Users\Tiger\AppData\Local\hermes\hermes-agent\tools\delegate_tool.py`
- `def delegate_task(..., role: Optional[str] = None, background: Optional[bool] = None, parent_agent=None) -> str:`

### 4) Plugin drops `background` in multiple entrypoints
Same plugin file also drops `background` in:
- `_install_invoke_tool_patch()` → intercepts runtime tool calls and forwards args manually
- `_register_delegate_tool()` → re-registers tool handler and forwards args manually

This means the regression is structural, not a one-off call-site problem.

## Why it broke now
The plugin exists to preserve `profile` support for delegated children. Hermes core evolved and added `background` to `delegate_task`, but the compatibility shim was not updated to mirror the new function signature.

## Minimal fix
Update `C:\Users\Tiger\AppData\Local\hermes\plugins\delegate-profile-contract\__init__.py` to thread `background` through all three places:

1. `patched_delegate_task(..., background: Optional[bool] = None, ...)`
2. `original_delegate_task(..., background=background, ...)`
3. `_install_invoke_tool_patch()` forwarder:
   - `background=function_args.get("background")`
4. `_register_delegate_tool()` handler:
   - `background=args.get("background")`

## Suggested follow-up verification
After patching/restarting Hermes:
1. Call `delegate_task(goal="test", context="noop", toolsets=["file"])`
2. Call `delegate_task(goal="test", context="noop", toolsets=["file"], background=true)`
3. Call `delegate_task(goal="test", context="noop", toolsets=["file"], profile="reviewer")`
4. Call `delegate_task(goal="test", context="noop", toolsets=["file"], profile="reviewer", background=true)`

Expected: all dispatch successfully; async calls return a delegation handle instead of argument errors.

## Current recommendation
Treat `delegate-profile-contract` as the immediate blocker. Either:
- patch the plugin to pass through `background`, or
- temporarily disable the plugin if profile-aware delegation is not needed right now.
