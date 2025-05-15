# Create src directories if they don't exist
$directories = @(
    "client/src",
    "server/src",
    "shared/src"
)
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# Move frontend source files
$frontendSourceFiles = @(
    "src/components",
    "src/pages",
    "src/hooks",
    "src/utils",
    "src/styles",
    "src/types",
    "src/api",
    "src/store",
    "src/context"
)

foreach ($dir in $frontendSourceFiles) {
    if (Test-Path $dir) {
        $targetDir = "client/src/$($dir -replace '^src/', '')"
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force
        }
        Move-Item -Path "$dir/*" -Destination $targetDir -Force
    }
}

# Move backend source files
$backendSourceFiles = @(
    "src/routes",
    "src/controllers",
    "src/models",
    "src/middleware",
    "src/config",
    "src/services",
    "src/utils"
)

foreach ($dir in $backendSourceFiles) {
    if (Test-Path $dir) {
        $targetDir = "server/src/$($dir -replace '^src/', '')"
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force
        }
        Move-Item -Path "$dir/*" -Destination $targetDir -Force
    }
}

# Move shared source files
$sharedSourceFiles = @(
    "src/types",
    "src/utils",
    "src/constants"
)

foreach ($dir in $sharedSourceFiles) {
    if (Test-Path $dir) {
        $targetDir = "shared/src/$($dir -replace '^src/', '')"
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force
        }
        Move-Item -Path "$dir/*" -Destination $targetDir -Force
    }
}

# Create index.ts in shared/src
$sharedIndexContent = @"
// Export shared types, utilities, and constants
export * from './types';
export * from './utils';
export * from './constants';
"@
Set-Content -Path "shared/src/index.ts" -Value $sharedIndexContent

Write-Host "Source files migrated! Please check the new directory structure and update any import paths as needed." 