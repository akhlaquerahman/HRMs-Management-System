$baseDir = "c:\Users\Admin\Desktop\HRMs Project"
cd $baseDir

# Step 1: Cleanup old files and directories (except docs)
$itemsToRemove = @("src", "prisma", "frontend", "backend", "shared", "node_modules", "package.json", "tsconfig.json", ".env", "middleware.ts", "package-lock.json")
foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item -Recurse -Force $item
    }
}

# Step 2: Create new directory structure
$dirs = @(
    "backend/prisma",
    "backend/src/config",
    "backend/src/controllers",
    "backend/src/middlewares",
    "backend/src/modules/auth",
    "backend/src/routes",
    "backend/src/services",
    "backend/src/utils",
    "frontend/src/app/(auth)/login",
    "frontend/src/app/(auth)/forgot-password",
    "frontend/src/app/(dashboard)",
    "frontend/src/components/layout",
    "frontend/src/components/ui",
    "frontend/src/lib",
    "frontend/src/providers",
    "frontend/src/store",
    "frontend/public"
)

foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
}

Write-Output "Cleanup and directory creation complete."
