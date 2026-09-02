<#
.SYNOPSIS
  Install the teachkit skills into every agent home found on this machine.

.DESCRIPTION
  Copies skills/teach and skills/teach-adapt into each target agent's skills
  directory, replacing any previous copy. Nothing outside those two folders is
  touched.

.PARAMETER Targets
  Which agents to install for. Defaults to every one whose home directory
  already exists. Valid: claude, codex, agents.

.PARAMETER List
  Print what would be installed and where, then exit.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File install.ps1
  powershell -ExecutionPolicy Bypass -File install.ps1 -Targets claude,codex
#>
[CmdletBinding()]
param(
  [string[]] $Targets,
  [switch] $List
)

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $repo 'skills'
$skills = @('teach', 'teach-adapt')

# name -> the directory that must already exist, and where skills go inside it
$homes = [ordered]@{
  claude = @{ Root = Join-Path $HOME '.claude'; Skills = Join-Path $HOME '.claude\skills' }
  codex  = @{ Root = Join-Path $HOME '.codex';  Skills = Join-Path $HOME '.codex\skills' }
  agents = @{ Root = Join-Path $HOME '.agents'; Skills = Join-Path $HOME '.agents\skills' }
}

if ($Targets) {
  # `powershell -File install.ps1 -Targets claude,codex` hands the whole thing
  # over as one string, so split it here rather than relying on the binder.
  $Targets = $Targets |
    ForEach-Object { $_ -split '[,\s]+' } |
    Where-Object { $_ } |
    ForEach-Object { $_.ToLowerInvariant() }
  $unknown = $Targets | Where-Object { -not $homes.Contains($_) }
  if ($unknown) { throw "Unknown target(s): $($unknown -join ', '). Valid: $($homes.Keys -join ', ')" }
  $chosen = $Targets
} else {
  $chosen = $homes.Keys | Where-Object { Test-Path $homes[$_].Root }
  if (-not $chosen) { throw "No agent home found under $HOME. Pass -Targets explicitly." }
}

foreach ($name in $chosen) {
  $dest = $homes[$name].Skills
  if ($List) {
    Write-Host "$name -> $dest"
    continue
  }
  if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
  foreach ($skill in $skills) {
    $to = Join-Path $dest $skill
    if (Test-Path $to) { Remove-Item -Recurse -Force $to }
    Copy-Item -Recurse -Path (Join-Path $source $skill) -Destination $to
    # node_modules and build output can exist if the scaffold was run in place.
    foreach ($junk in @('scaffold\node_modules', 'scaffold\.svelte-kit', 'scaffold\dist')) {
      $j = Join-Path $to $junk
      if (Test-Path $j) { Remove-Item -Recurse -Force $j }
    }
    Write-Host "installed $skill -> $to"
  }
}

if (-not $List) {
  Write-Host ''
  Write-Host 'Done. Restart the agent so it picks up the new skills.'
}
