#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Create WordPress-compatible ZIP for ChurchTools Suite - Elementor Integration

.DESCRIPTION
    Creates a properly structured ZIP file for WordPress plugin installation:
    - Creates churchtools-suite-elementor/ folder structure
    - Excludes .git, node_modules, and development files
    - Normalizes paths to forward slashes (WordPress requirement)
    - Archives old ZIPs to keep workspace clean

.PARAMETER Version
    Plugin version (e.g., "0.5.1")

.EXAMPLE
    .\create-wp-zip.ps1 -Version "0.5.1"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host "=== ChurchTools Suite - Elementor Integration ZIP Creator ===" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host ""

# Paths
$scriptDir = $PSScriptRoot
$rootDir = Split-Path -Parent $scriptDir
$outputDir = "C:\privat"
$tempDir = Join-Path $env:TEMP "cts-elementor-build"
$pluginFolder = "churchtools-suite-elementor"
$zipName = "churchtools-suite-elementor-$Version.zip"
$zipPath = Join-Path $outputDir $zipName

# Archive old versions
if (Test-Path $zipPath) {
    $archiveDir = Join-Path $outputDir "archiv"
    if (-not (Test-Path $archiveDir)) {
        New-Item -ItemType Directory -Path $archiveDir | Out-Null
    }
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $archiveName = "churchtools-suite-elementor-$Version-$timestamp.zip"
    $archivePath = Join-Path $archiveDir $archiveName
    Move-Item -Path $zipPath -Destination $archivePath -Force
    Write-Host "Archived: $zipName -> archiv\$archiveName" -ForegroundColor Gray
}

# Clean temp directory
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Create plugin folder structure
$buildPluginDir = Join-Path $tempDir $pluginFolder
New-Item -ItemType Directory -Path $buildPluginDir | Out-Null

# Files and folders to include
$includes = @(
    'includes',
    'churchtools-suite-elementor.php',
    'README.md',
    'readme.txt',
    'CHANGELOG.md'
)

# Exclusions (glob patterns)
$exclusions = @(
    '.git',
    '.github',
    'node_modules',
    'vendor',
    'tests',
    'scripts',
    '.gitignore',
    '.gitattributes',
    'composer.json',
    'composer.lock',
    'package.json',
    'package-lock.json',
    '.editorconfig',
    '.vscode',
    '*.log',
    '*.tmp'
)

Write-Host "Copying files..." -ForegroundColor Green
foreach ($item in $includes) {
    $sourcePath = Join-Path $rootDir $item
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $buildPluginDir $item
        if (Test-Path $sourcePath -PathType Container) {
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            Write-Host "  Copied: $item" -ForegroundColor Gray
        } else {
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "  Copied: $item" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Warning: $item not found" -ForegroundColor Yellow
    }
}

# Remove excluded items from build
foreach ($pattern in $exclusions) {
    $excludePath = Join-Path $buildPluginDir $pattern
    if (Test-Path $excludePath) {
        Remove-Item -Path $excludePath -Recurse -Force
        Write-Host "  Excluded: $pattern" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Creating ZIP with WordPress-compatible paths..." -ForegroundColor Green

# Create ZIP (PowerShell 5.1 compatible)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, $compressionLevel, $false)

# Normalize paths to forward slashes (WordPress requirement)
Write-Host "Normalizing paths to forward slashes..." -ForegroundColor Green
Add-Type -AssemblyName System.IO.Compression
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Update')

$entriesToFix = @()
foreach ($entry in $zip.Entries) {
    if ($entry.FullName -match '\\') {
        $entriesToFix += @{
            OldName = $entry.FullName
            NewName = $entry.FullName -replace '\\', '/'
        }
    }
}

# Fix paths by recreating entries
foreach ($fix in $entriesToFix) {
    $oldEntry = $zip.GetEntry($fix.OldName)
    if ($oldEntry) {
        # Extract content
        $stream = $oldEntry.Open()
        $reader = New-Object System.IO.BinaryReader($stream)
        $content = $reader.ReadBytes([int]$oldEntry.Length)
        $reader.Close()
        $stream.Close()
        
        # Delete old entry
        $oldEntry.Delete()
        
        # Create new entry with correct path
        $newEntry = $zip.CreateEntry($fix.NewName, $compressionLevel)
        $newStream = $newEntry.Open()
        $newStream.Write($content, 0, $content.Length)
        $newStream.Close()
    }
}

$zip.Dispose()

# Validate ZIP structure
Write-Host "Validating..." -ForegroundColor Green
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entries = $zip.Entries | Select-Object -First 5
Write-Host ""
Write-Host "First 5 entries:" -ForegroundColor Cyan
foreach ($entry in $entries) {
    Write-Host "  $($entry.FullName)" -ForegroundColor White
}
$zip.Dispose()

# Validate WordPress structure
Write-Host ""
Write-Host "Validating WordPress structure..." -ForegroundColor Green
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$pluginFile = $zip.Entries | Where-Object { $_.FullName -eq "$pluginFolder/churchtools-suite-elementor.php" }
$hasBackslash = $zip.Entries | Where-Object { $_.FullName -match '\\' }
$zip.Dispose()

if ($pluginFile) {
    Write-Host "Found with path '$($pluginFile.FullName)': " -NoNewline -ForegroundColor Green
    Write-Host "True" -ForegroundColor Green
    Write-Host "SUCCESS: WordPress structure OK (forward slashes)" -ForegroundColor Green
} else {
    Write-Host "ERROR: Plugin file not found at expected path!" -ForegroundColor Red
    Write-Host "Expected: $pluginFolder/churchtools-suite-elementor.php" -ForegroundColor Red
}

if ($hasBackslash) {
    Write-Host "WARNING: Some paths still contain backslashes!" -ForegroundColor Yellow
}

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

# Final info
Write-Host ""
Write-Host "DONE!" -ForegroundColor Green
Write-Host "File: $zipPath" -ForegroundColor Cyan
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entryCount = $zip.Entries.Count
$zip.Dispose()
Write-Host "Entries: $entryCount" -ForegroundColor Cyan
Write-Host ""
