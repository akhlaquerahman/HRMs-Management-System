$baseDir = "c:\Users\Admin\Desktop\HRMs Project"
cd $baseDir

# Step 1: Directory Structure
$dirs = @(
    "docs",
    "shared/types",
    "shared/constants",
    "frontend/src/app",
    "frontend/src/components/ui",
    "frontend/src/components/shared",
    "frontend/src/features/auth",
    "frontend/src/features/employee",
    "frontend/src/features/attendance",
    "frontend/src/features/leave",
    "frontend/src/features/notification",
    "frontend/src/features/reports",
    "frontend/src/features/analytics",
    "frontend/src/features/settings",
    "frontend/src/features/rbac",
    "frontend/src/hooks",
    "frontend/src/store",
    "frontend/src/services",
    "frontend/src/providers",
    "frontend/src/lib",
    "frontend/src/types",
    "frontend/src/constants",
    "frontend/src/styles",
    "frontend/public",
    "backend/src/modules/auth",
    "backend/src/modules/employee",
    "backend/src/modules/attendance",
    "backend/src/modules/leave",
    "backend/src/modules/notification",
    "backend/src/modules/reports",
    "backend/src/modules/analytics",
    "backend/src/modules/settings",
    "backend/src/modules/rbac",
    "backend/src/controllers",
    "backend/src/services",
    "backend/src/repositories",
    "backend/src/routes",
    "backend/src/middlewares",
    "backend/src/validators",
    "backend/src/utils",
    "backend/src/config",
    "backend/src/database",
    "backend/src/jobs",
    "backend/src/events",
    "backend/src/types",
    "backend/prisma"
)

foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    New-Item -ItemType File -Force -Path "$d/.gitkeep" | Out-Null
}

# Add UI component placeholders
$uiComponents = @("Button", "Input", "Table", "Modal", "Dialog", "Drawer", "Pagination", "Badge", "Card", "Form", "Skeleton", "EmptyState", "DataTable")
foreach ($comp in $uiComponents) {
    Set-Content -Path "frontend/src/components/ui/$comp.tsx" -Value "// Placeholder for $comp component"
}

Write-Output "Directories and UI placeholders created."
