<#
  MiniBank 4-agent pipeline - single-command orchestrator (Windows / PowerShell 7+).

      ./run-pipeline.ps1

  Runs the four agents headless via the Claude Code CLI, in order, each with the
  model declared in its *.agent.md frontmatter. Each agent reads its inputs,
  auto-loads its referenced skill(s), and writes its output artifact(s).

  Upstream steps (Bug Researcher, Bug Planner) are provided as seed context in
  context/bugs/001/ and are NOT re-run here.

  Requirements: `claude` CLI logged in, and `dotnet` SDK 10+ on PATH.
#>

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$BugDir = 'context/bugs/001'

# Models per agent (must match each agent's frontmatter `model:`).
$ModelVerifier = 'opus'     # claude-opus-4-8   - research fact-checking
$ModelFixer    = 'haiku'    # claude-haiku-4-5  - mechanical plan execution
$ModelSecurity = 'opus'     # claude-opus-4-8   - security review
$ModelTests    = 'sonnet'   # claude-sonnet-4-6 - test generation

# Permission mode: acceptEdits lets agents write files unattended.
# For a fully hands-off run, set $env:CLAUDE_PERM = '--dangerously-skip-permissions'.
$ClaudePerm = if ($env:CLAUDE_PERM) { $env:CLAUDE_PERM } else { '--permission-mode acceptEdits' }

# Admin key the fixed app/tests expect (kept out of source; injected at runtime).
if (-not $env:MINIBANK_ADMIN_API_KEY) {
    $env:MINIBANK_ADMIN_API_KEY = 'super-secret-admin-key-12345'
}

function Invoke-Agent {
    param([string]$Label, [string]$Model, [string]$AgentFile)

    Write-Host ""
    Write-Host "==================================================================="
    Write-Host "  AGENT: $Label   (model: $Model)"
    Write-Host "  spec : $AgentFile"
    Write-Host "==================================================================="

    $spec = Get-Content -Raw -Path $AgentFile
    $prompt = @"
$spec

---
You are running headless as the agent defined above. Steps:
1. Read every file listed under the agent's 'inputs'.
2. Load and apply every file listed under 'skills:' (read it first).
3. Perform the agent's procedure exactly.
4. Write the file(s) listed under 'outputs'.
Operate only inside this homework-4 directory. Do not touch other homework folders.
"@

    claude -p $prompt --model $Model $ClaudePerm.Split(' ')
}

Write-Host "### MiniBank 4-agent pipeline ###"
Write-Host "Run order: Research Verifier -> Bug Fixer -> Security Verifier -> Unit Test Generator"

Invoke-Agent '1/4 Bug Research Verifier' $ModelVerifier 'agents/research-verifier.agent.md'
Invoke-Agent '2/4 Bug Fixer'             $ModelFixer    'agents/bug-fixer.agent.md'
Invoke-Agent '3/4 Security Verifier'     $ModelSecurity 'agents/security-verifier.agent.md'
Invoke-Agent '4/4 Unit Test Generator'   $ModelTests    'agents/unit-test-generator.agent.md'

Write-Host ""
Write-Host "=== Pipeline complete - final verification build/test ==="
dotnet test --nologo

Write-Host ""
Write-Host "Artifacts:"
Write-Host "  $BugDir/research/verified-research.md"
Write-Host "  $BugDir/fix-summary.md"
Write-Host "  $BugDir/security-report.md"
Write-Host "  $BugDir/test-report.md"
