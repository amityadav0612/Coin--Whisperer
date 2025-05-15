# Create folders if they don't exist
if (!(Test-Path "client")) { mkdir client }
if (!(Test-Path "server")) { mkdir server }
if (!(Test-Path "shared")) { mkdir shared }

# Move frontend files to client/
Move-Item -Path vite.config.ts -Destination client/ -Force -ErrorAction SilentlyContinue
Move-Item -Path index.html -Destination client/ -Force -ErrorAction SilentlyContinue
Move-Item -Path tailwind.config.ts -Destination client/ -Force -ErrorAction SilentlyContinue
Move-Item -Path postcss.config.js -Destination client/ -Force -ErrorAction SilentlyContinue

# Move shared code
if (Test-Path "schema.ts") { Move-Item -Path schema.ts -Destination shared/ -Force }

# Move backend files to server/
$backendFiles = @("index.ts", "auth.ts", "storage.ts", "db.ts", "config.ts", "routes.ts", "vite.ts")
foreach ($file in $backendFiles) {
    if (Test-Path $file) { Move-Item -Path $file -Destination server/ -Force }
}

# Move backend folders to server/
$backendDirs = @("services", "db")
foreach ($dir in $backendDirs) {
    if (Test-Path $dir) { Move-Item -Path $dir -Destination server/ -Force }
}

Write-Host "Migration step 1 complete. Please review the structure and update your package.json files as described in the migration plan."