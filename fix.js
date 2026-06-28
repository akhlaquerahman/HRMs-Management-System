const fs = require('fs');
const files = [
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\components\\layout\\Sidebar.tsx',
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\components\\layout\\Navbar.tsx',
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\app\\(dashboard)\\page.tsx',
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\app\\(dashboard)\\layout.tsx',
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\app\\(auth)\\login\\page.tsx',
  'c:\\Users\\Admin\\Desktop\\HRMs Project\\frontend\\src\\app\\(auth)\\forgot-password\\page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/@\/src\//g, '@/');
  fs.writeFileSync(file, content);
});
console.log('Fixed imports');
