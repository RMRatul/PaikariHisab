const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing dummy data (if necessary) or just appending...');

  // Create 30 Customers
  const customers = [];
  for (let i = 1; i <= 30; i++) {
    customers.push({
      name: `Customer Name ${i}`,
      phone: `017000000${i.toString().padStart(2, '0')}`,
      shopName: `Shop ${i} Enterprise`,
      shopAddress: `${i} Main Bazaar, City`,
      dueBalance: Math.floor(Math.random() * 5000),
    });
  }

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });
  }
  console.log('Created 30 Customers.');

  // Create 30 Suppliers
  const suppliers = [];
  for (let i = 1; i <= 30; i++) {
    suppliers.push({
      name: `Supplier Name ${i}`,
      phone: `018000000${i.toString().padStart(2, '0')}`,
      company: `Global Wholesale ${i}`,
      address: `Industrial Area Block ${i}`,
      dueBalance: Math.floor(Math.random() * 10000),
    });
  }

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { phone: s.phone },
      update: {},
      create: s,
    });
  }
  console.log('Created 30 Suppliers.');

  // Create Categories and Products
  const categories = ['Electronics', 'Groceries', 'Hardware', 'Clothing', 'Stationery'];
  const products = [];
  for (let i = 1; i <= 30; i++) {
    const category = categories[i % categories.length];
    products.push({
      code: `PROD-${i.toString().padStart(3, '0')}`,
      name: `Test Product ${category} ${i}`,
      category: category,
      purchasePrice: 100 + (i * 5),
      sellingPrice: 150 + (i * 8),
      stock: 50 + i,
    });
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log('Created 30 Products.');

  // Create Expense Categories and Expenses
  const expCats = ['Rent', 'Utilities', 'Salary', 'Transport', 'Meals'];
  for (const c of expCats) {
    await prisma.expenseCategory.upsert({
      where: { name: c },
      update: {},
      create: { name: c },
    });
  }

  const savedExpCats = await prisma.expenseCategory.findMany();
  if (savedExpCats.length > 0) {
    const expenses = [];
    for (let i = 1; i <= 30; i++) {
      const cat = savedExpCats[i % savedExpCats.length];
      expenses.push({
        categoryId: cat.id,
        amount: 500 + (i * 10),
        description: `Dummy Expense ${i}`,
      });
    }
    
    // Quick bulk create for expenses
    await prisma.expense.createMany({
      data: expenses,
    });
    console.log('Created 30 Expenses.');
  }

  // Create some Sales and Purchases to flesh out the Dashboard
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
