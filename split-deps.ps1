# Define frontend and backend dependency keywords
$frontendDeps = @(
  "react", "react-dom", "react-router", "react-router-dom", "vite", "tailwindcss", "postcss", "autoprefixer",
  "@vitejs", "@tanstack", "@hookform", "@headlessui", "@radix-ui", "lucide-react", "zod"
)
$backendDeps = @(
  "express", "mongoose", "passport", "memorystore", "cross-env", "tsx", "dotenv", "cors", "cookie-parser",
  "jsonwebtoken", "bcrypt", "mongodb", "drizzle-orm"
)

# Read root package.json
$rootPkg = Get-Content "package.json" | ConvertFrom-Json

# Prepare new package.json objects
$clientPkg = @{
  name = "coinwhisperer-client"
  private = $true
  scripts = @{
    dev = "vite"
    build = "vite build"
    preview = "vite preview"
  }
  dependencies = @{}
}
$serverPkg = @{
  name = "coinwhisperer-server"
  private = $true
  scripts = @{
    dev = "cross-env NODE_ENV=development tsx index.ts"
    build = "tsc"
    start = "node dist/index.js"
  }
  dependencies = @{}
}

# Move dependencies
foreach ($dep in $rootPkg.dependencies.PSObject.Properties.Name) {
  if ($frontendDeps | Where-Object { $dep -like "*$_*" }) {
    $clientPkg.dependencies[$dep] = $rootPkg.dependencies[$dep]
  } elseif ($backendDeps | Where-Object { $dep -like "*$_*" }) {
    $serverPkg.dependencies[$dep] = $rootPkg.dependencies[$dep]
  } else {
    # Default: put in server (adjust as needed)
    $serverPkg.dependencies[$dep] = $rootPkg.dependencies[$dep]
  }
}

# Write new package.json files
$clientPkg | ConvertTo-Json -Depth 10 | Set-Content "client/package.json"
$serverPkg | ConvertTo-Json -Depth 10 | Set-Content "server/package.json"

Write-Host "Dependencies split! Please run 'npm install' in both client and server directories."