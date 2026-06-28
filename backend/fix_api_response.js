const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'modules');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.controller.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix ApiResponse.success(data, "message") -> new ApiResponse(true, "message", data)
      content = content.replace(/ApiResponse\.success\(([^,]+),\s*([^)]+)\)/g, 'new ApiResponse(true, $2, $1)');
      // Fix ApiResponse.success(data) -> new ApiResponse(true, "Success", data)
      content = content.replace(/ApiResponse\.success\(([^)]+)\)/g, 'new ApiResponse(true, "Success", $1)');
      
      // Fix ApiResponse.error(msg) -> new ApiResponse(false, msg)
      content = content.replace(/ApiResponse\.error\(([^)]+)\)/g, 'new ApiResponse(false, $1)');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(modulesDir);
console.log("Fixed ApiResponse usages");
