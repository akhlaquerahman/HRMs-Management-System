const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.ts');

files.forEach(file => {
  if (file.includes('lib/prisma.ts') || file.includes('prismaMiddleware.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("import { PrismaClient } from '@prisma/client'") && content.includes("const prisma = new PrismaClient();")) {
    content = content.replace("import { PrismaClient } from '@prisma/client';", "");
    content = content.replace("const prisma = new PrismaClient();", "");
    
    const normalizedFile = file.replace(/\\/g, '/');
    const depth = Math.max(0, normalizedFile.split('/').length - 2);
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    const importStatement = `import { prisma } from '${prefix}lib/prisma';\n`;
    
    content = importStatement + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
