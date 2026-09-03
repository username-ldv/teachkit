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

.PARAMETER Copy
  Put a real copy in every target instead of linking the others to ~/.agents.
  Use this if an agent turns out not to follow a symlinked skill directory.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File install.ps1
  powershell -ExecutionPolicy Bypass -File install.ps1 -Targets claude,codex
  powershell -ExecutionPolicy Bypass -File install.ps1 -List
#>
[CmdletBinding()]
param(
  [string[]] $Targets,
  [switch] $List,
  [switch] $Copy
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

# Agents increasingly read the vendor-neutral ~/.agents/skills as well as their
# own home, so a real copy in each one shows up as the SAME skill twice in the
# menu. When .agents is among the targets it gets the real copy and the others
# get a symlink to it — which is what ~/.claude/skills/find-skills already does
# on machines that have it. Pass -Copy if an agent turns out not to follow a
# symlinked skill directory.
$canonical = if ($chosen -contains 'agents') { 'agents' } else { $null }
if ($canonical) { $chosen = @($canonical) + ($chosen | Where-Object { $_ -ne $canonical }) }

foreach ($name in $chosen) {
  $dest = $homes[$name].Skills
  if ($List) {
    $how = if ($canonical -and $name -ne $canonical -and -not $Copy) { 'link' } else { 'copy' }
    Write-Host "$name -> $dest ($how)"
    continue
  }
  if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
  foreach ($skill in $skills) {
    $to = Join-Path $dest $skill
    # Test-Path follows links, so a broken symlink needs the item itself.
    if ((Test-Path $to) -or (Get-Item $to -Force -ErrorAction Ignore)) {
      Remove-Item -Recurse -Force $to
    }

    if ($canonical -and $name -ne $canonical -and -not $Copy) {
      $target = Join-Path $homes[$canonical].Skills $skill
      try {
        New-Item -ItemType SymbolicLink -Path $to -Target $target -ErrorAction Stop | Out-Null
        Write-Host "linked    $skill -> $to"
        continue
      } catch {
        # Creating a symlink needs Developer Mode or an elevated shell.
        Write-Warning "could not link $to ($($_.Exception.Message)); copying instead"
      }
    }

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
