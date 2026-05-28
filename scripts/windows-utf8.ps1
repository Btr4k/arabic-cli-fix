# Arabic CLI Fix — Windows UTF-8 Setup Script
#
# Dot-source this script to apply UTF-8 settings to your current PowerShell session:
#
#   . .\scripts\windows-utf8.ps1
#
# Settings applied are session-only. To persist, add them to your $PROFILE.

$sep = "-" * 50

Write-Host ""
Write-Host "Arabic CLI Fix — Windows UTF-8 Setup"
Write-Host $sep

# Code page
$currentCP = [Console]::OutputEncoding.CodePage
if ($currentCP -ne 65001) {
    Write-Host "Code page: $currentCP -> switching to 65001 (UTF-8)..."
    chcp 65001 | Out-Null
} else {
    Write-Host "Code page: 65001 (UTF-8) -- already set."
}

# Console encoding
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
$OutputEncoding           = [System.Text.UTF8Encoding]::new()

# Environment variables
$env:LANG             = "en_US.UTF-8"
$env:LC_ALL           = "en_US.UTF-8"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "Encoding:  OutputEncoding, InputEncoding set to UTF-8."
Write-Host "Env vars:  LANG, LC_ALL, PYTHONIOENCODING set to UTF-8."
Write-Host $sep

# Windows Terminal check
if ($env:WT_SESSION) {
    Write-Host "Terminal:  Windows Terminal detected -- good choice for Arabic."
} else {
    Write-Host "Terminal:  Windows Terminal NOT detected."
    Write-Host "           Recommended: https://aka.ms/terminal"
    Write-Host "           Classic CMD and conhost have limited Arabic rendering."
}

# PowerShell version check
$psVersion = $PSVersionTable.PSVersion.Major
if ($psVersion -ge 7) {
    Write-Host "Shell:     PowerShell $($PSVersionTable.PSVersion) -- OK."
} else {
    Write-Host "Shell:     PowerShell $($PSVersionTable.PSVersion) detected."
    Write-Host "           Recommended: PowerShell 7 -- https://aka.ms/powershell"
}

Write-Host $sep
Write-Host "Font tip:  For best Arabic rendering, use a font that includes Arabic glyphs."
Write-Host "           Recommended: Cascadia Code (Windows Terminal default) or Noto Sans Arabic."
Write-Host "           Set in Windows Terminal: Settings > Profile > Appearance > Font face."
Write-Host ""
Write-Host "RTL tip:   For right-to-left text direction in Windows Terminal:"
Write-Host "           Settings > Profile > Appearance > Text direction > Right to left."
Write-Host $sep
Write-Host ""
Write-Host "Verify:  arabic-cli-fix doctor"
Write-Host "Test:    arabic-cli-fix test"
Write-Host ""
