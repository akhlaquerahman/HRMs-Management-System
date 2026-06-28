import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));
  const employees = await prisma.employee.findMany();
  console.log('Employees:', employees.map(e => ({ id: e.id, email: e.email, userId: e.userId })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
