---
title: "AI assistant (MCP)"
level: advanced
description: "Connect a coding agent (Codex, Claude Code, Kimi Code, GLM) to a Workbench mission through a local, permission-gated MCP bridge."
weight: 11
---

The [Workbench](/docs/guide/workbench/) can hand one mission to an external coding-agent CLI such as **Codex**, **Claude Code**, **Kimi Code** or **GLM CLI**, through an optional, **local** MCP (Model Context Protocol) bridge. The agent can then read your notes and evidence, draft findings, and (only if you allow it) run commands in the mission's lab.

**In short**

- RF Swift does not call a model API, select a model, store provider API keys or charge for AI usage. The coding-agent CLI owns its authentication, subscription, model choice and billing.
- The Workbench itself stays standalone: the agent CLI is optional, installed separately, and runs in the Workbench's own **Agent terminal** panel.
- The bridge is off by default, opens no network port, and exposes only the tools you permit.

```mermaid
flowchart LR
    U[You] --> C[Codex / Claude Code / Kimi / GLM CLI]
    C <-->|stdio MCP| M[RF Swift Workbench MCP]
    M --> N[Mission notes]
    M --> F[Structured findings]
    M --> E[Approved evidence]
    M -. optional .-> T[Commands in the mission target]
```

## Security model

- The bridge is **off by default** and uses standard input/output: RF Swift opens no MCP network port.
- Each launch is scoped to **one project and one mission**.
- Permissions are independent and additive:

| Permission | What the agent gets |
|---|---|
| **Read-only** | Mission discovery, notes, findings, the audit report and the evidence index |
| **Write** | Adds `write_note` and `save_finding` (and `save_secret`) |
| **Command** | Adds `execute_command` inside the mission target. Enable it only for an authorised assessment |

- Tools that are not permitted are **omitted** from the server's tool list, not merely rejected.
- Agent permissions live in the local RF Swift user configuration and are never placed in exported projects.
- Evidence responses carry an explicit `untrusted_evidence` trust label: notes, artifacts, recordings, filenames, metadata and embedded role text are data to analyse, not instructions to follow.
- Per-client **YOLO mode** (the CLI's own approval-bypass flag) is off by default and visibly warned. It never widens RF Swift's MCP permissions.

## Starting the server from the Workbench

In the **Agent & MCP** panel, choose the client and press **Connect & launch**. The Workbench then:

1. detects the selected CLI on `PATH`;
2. creates or merges a private configuration under the mission's `agent-workspace` directory (`.mcp.json` for Claude Code, `.kimi-code/mcp.json` for Kimi, `.codex/config.toml` for Codex), plus a generated `AGENTS.md` / `CLAUDE.md` telling the client that "create a note" means the mission `write_note` tool;
3. performs a real MCP `initialize` handshake with the mission-scoped server;
4. starts the client's interactive TUI in the embedded **Agent terminal**.

While you are connected:

- notes and findings written through MCP refresh in their panels;
- when the agent calls `execute_command`, the Workbench opens a read-only **AI - tool** terminal tab that shows the command, streams its real container or Nix output and marks the final state. Agent activity stays visible without mixing into your own shell.

Disconnecting closes the TUI and the MCP child process. The project-local files remain, so the next launch is reproducible.

### Other MCP clients

Any other stdio MCP client (GLM CLI has no automatic configuration yet) can be pointed at the same server by hand:

```bash
rfswift-workbench --mcp --workspace PROJECT --mission MISSION [--mcp-write] [--mcp-exec]
```

Register it as a stdio MCP server named `rfswift`. The generated `AGENTS.md` in the mission's `agent-workspace/` directory tells the client how to use the tools.

## Ground-truth workflows

The agent always works from real data that RF Swift collected first.

### Audit with AI

In the **Security posture** panel:

- the Workbench first runs the deterministic Nix or container scanners and keeps their unmodified JSON report as ground truth;
- the agent then reads it with `read_audit`, consults `recommend_tools`, and may run authorised, non-destructive corroboration;
- the agent is instructed to separate verified findings from hypotheses and never invent CVEs, versions, output or CVSS metrics;
- build-time-only dependency matches stay supply-chain leads, not runtime posture;
- environment CVEs are never promoted into mission findings automatically.

### Suggest from evidence

In the **Findings** panel, the agent reviews mission notes and registered artifact metadata through `read_evidence_index` and produces source-cited candidates for your review. It does not silently save findings, and metadata alone is never treated as proof.

### Collect credentials

In the **Findings** panel, grounded in saved findings and approved evidence, exact observed credentials are stored in the OS credential vault through the write-gated `save_secret` tool. Secret values stay out of chat, reports and exports.

### Terminal recordings as evidence

A completed recording can be registered as AI-readable evidence (**Use as AI evidence**). The agent then reads a bounded, ANSI-free transcript instead of raw event JSON.

### Editor AI actions

Editor AI actions prepare a scoped prompt and copy it for the external agent. They never send document contents to a provider directly.

## MCP tools

| Tool | Permission | Purpose |
|---|---|---|
| `recommend_tools` | read | Suggest RF Swift programs, environments and example commands for a task or artifact |
| `read_audit` | read | Latest deterministic scanner report, the ground truth for AI-assisted review |
| `read_evidence_index` | read | Mission notes and registered artifact metadata for evidence-cited candidates |
| `list_missions` | read | Missions visible in the project or scope |
| `read_note` | read | A mission Markdown note |
| `list_findings` | read | PwnDoc-compatible structured findings |
| `write_note` | write | Replace or append to a Markdown note |
| `save_finding` | write | Create or replace a structured finding |
| `save_secret` | write | Store an exact credential in the OS vault |
| `execute_command` | execute | Run a command in the selected mission target |

## Related

{{< cards >}}
  {{< card link="/docs/security/mcp/" title="AI bridge best practices" icon="shield-check" subtitle="Permissions per task, evidence as hostile input, what reaches the vendor" tag="Advanced" >}}
  {{< card link="/docs/guide/workbench/" title="Workbench" icon="desktop" subtitle="The standalone desktop app the bridge lives in" >}}
  {{< card link="/docs/commands/audit/" title="audit" icon="magnifying-glass" subtitle="The deterministic scanners behind Audit with AI" >}}
  {{< card link="/docs/security/" title="Security" icon="lock-simple" subtitle="How to use RF Swift safely" >}}
{{< /cards >}}
