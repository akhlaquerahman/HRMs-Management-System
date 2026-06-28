$baseDir = "c:\Users\Admin\Desktop\HRMs Project"
cd $baseDir

# Step 1: Cleanup old directories
$oldDirs = @("frontend", "backend", "shared")
foreach ($d in $oldDirs) {
    if (Test-Path $d) {
        Remove-Item -Recurse -Force $d
    }
}

# Step 2: Create new unified directory structure
$newDirs = @(
    "prisma",
    "src/app/(auth)",
    "src/app/(dashboard)",
    "src/app/api",
    "src/components/ui",
    "src/components/shared",
    "src/features/auth/components",
    "src/features/employee/components",
    "src/features/attendance/components",
    "src/features/leave/components",
    "src/features/notification/components",
    "src/features/dashboard/components",
    "src/lib"
)

foreach ($d in $newDirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    New-Item -ItemType File -Force -Path "$d/.gitkeep" | Out-Null
}

# Step 3: Create feature module placeholders
$features = @("auth", "employee", "attendance", "leave", "notification", "dashboard")
foreach ($f in $features) {
    Set-Content -Path "src/features/$f/actions.ts" -Value "// Server Actions for $f"
    Set-Content -Path "src/features/$f/queries.ts" -Value "// Prisma Queries for $f"
    Set-Content -Path "src/features/$f/schema.ts" -Value "// Zod Schemas for $f"
}

Write-Output "Refactoring cleanup and directory creation complete."
