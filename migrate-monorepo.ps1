# Create necessary directories if they don't exist
$directories = @("client", "server", "shared")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir
    }
}

# Move frontend-related files to client directory
$frontendFiles = @(
    "index.html",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "client/" -Force
    }
}

# Move backend-related files to server directory
$backendFiles = @(
    "drizzle.config.ts"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "server/" -Force
    }
}

# Create tsconfig.json in shared directory
$sharedTsConfig = @{
    compilerOptions = @{
        target = "ES2020"
        module = "ESNext"
        moduleResolution = "node"
        esModuleInterop = true
        strict = true
        skipLibCheck = true
        forceConsistentCasingInFileNames = true
        declaration = true
        outDir = "dist"
    }
    include = @("src/**/*")
    exclude = @("node_modules", "dist")
}

$sharedTsConfig | ConvertTo-Json -Depth 10 | Set-Content "shared/tsconfig.json"

Write-Host "Monorepo structure created! Please run 'npm run install:all' to install dependencies." 