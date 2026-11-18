import { PrismaClient, Role, ItemType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123', 10);

  const press = await prisma.department.create({ data: { name: 'Прессовый цех' } });
  const assembly = await prisma.department.create({ data: { name: 'Сборочный цех' } });
  const packing = await prisma.department.create({ data: { name: 'Участок упаковки' } });

  const users = [
    { login: 'admin', fullName: 'Администратор', role: Role.ADMIN, departmentId: null },
    { login: 'operator', fullName: 'Оператор Иванов', role: Role.OPERATOR, departmentId: null },
    { login: 'manager', fullName: 'Начальник Петров', role: Role.MANAGER, departmentId: press.id },
    { login: 'worker1', fullName: 'Работник Сидоров', role: Role.WORKER, departmentId: press.id },
    { login: 'worker2', fullName: 'Работник Кузнецов', role: Role.WORKER, departmentId: assembly.id },
  ];
  for (const u of users) {
    await prisma.user.create({ data: { ...u, passwordHash: hash } });
  }

  const eqPress = await prisma.equipment.create({
    data: { name: 'Пресс П-1', code: 'PR-01', departmentId: press.id },
  });
  const eqPump = await prisma.equipment.create({
    data: { name: 'Насос Н-2', code: 'PM-02', departmentId: press.id },
  });

  await prisma.normRange.createMany({
    data: [
      { equipmentId: eqPress.id, parameter: 'Температура', unit: '°C', min: 40, max: 80, warnMin: 45, warnMax: 75 },
      { equipmentId: eqPress.id, parameter: 'Давление', unit: 'бар', min: 2, max: 10, warnMin: 3, warnMax: 9 },
      { equipmentId: eqPump.id, parameter: 'Температура', unit: '°C', min: 20, max: 60, warnMin: 25, warnMax: 55 },
    ],
  });

  await prisma.checklistTemplate.create({
    data: {
      name: 'Чек-лист смены: Прессовый цех',
      departmentId: press.id,
      items: {
        create: [
          { type: ItemType.NUMBER, label: 'Пресс П-1: температура', unit: '°C', equipmentId: eqPress.id, order: 1 },
          { type: ItemType.NUMBER, label: 'Пресс П-1: давление', unit: 'бар', equipmentId: eqPress.id, order: 2 },
          { type: ItemType.NUMBER, label: 'Насос Н-2: температура', unit: '°C', equipmentId: eqPump.id, order: 3 },
          { type: ItemType.PLAN_CHECK, label: 'План смены выполнен', order: 4 },
        ],
      },
    },
  });

  console.log('Seed завершён');
}

main().catch(console.error).finally(() => prisma.$disconnect());
