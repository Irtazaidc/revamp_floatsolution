param(
  [Parameter(Mandatory = $true)]
  [string]$OldProjectRoot
)

$ErrorActionPreference = "Stop"

function Assert-PathExists([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label not found: $Path"
  }
}

$newRoot = Split-Path -Parent $PSScriptRoot
$newSrc = Join-Path $newRoot "src"
$oldSrc = Join-Path $OldProjectRoot "src"

Assert-PathExists $newSrc "New project src"
Assert-PathExists $oldSrc "Old project src"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $newRoot ".backup-old-erp-$timestamp"
New-Item -ItemType Directory -Path $backupDir | Out-Null

Write-Host "Backing up current src/app, src/assets, src/environments (if present)..."
foreach ($rel in @("app", "assets", "environments")) {
  $p = Join-Path $newSrc $rel
  if (Test-Path -LiteralPath $p) {
    Copy-Item -LiteralPath $p -Destination (Join-Path $backupDir $rel) -Recurse -Force
  }
}

Write-Host "Copying old ERP folders into this project..."
foreach ($rel in @("app", "assets", "environments")) {
  $from = Join-Path $oldSrc $rel
  $to = Join-Path $newSrc $rel
  if (Test-Path -LiteralPath $from) {
    if (Test-Path -LiteralPath $to) {
      Remove-Item -LiteralPath $to -Recurse -Force
    }
    Copy-Item -LiteralPath $from -Destination $to -Recurse -Force
  }
}

Write-Host "Optionally copying index.html/styles.scss/manifest.json if present in old src..."
foreach ($file in @("index.html", "styles.scss", "manifest.json", "favicon.ico", "web.config")) {
  $from = Join-Path $oldSrc $file
  $to = Join-Path $newSrc $file
  if (Test-Path -LiteralPath $from) {
    Copy-Item -LiteralPath $from -Destination $to -Force
  }
}

Write-Host ""
Write-Host "Done."
Write-Host "Backup created at: $backupDir"
