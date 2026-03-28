const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  // Create Category
  const category = await prisma.expenseCategory.upsert({
    where: { name: 'Office Utilities' },
    update: {},
    create: { name: 'Office Utilities' }
  });

  // Create Product
  const product = await prisma.product.upsert({
    where: { code: 'P-1001' },
    update: {},
    create: {
      code: 'P-1001',
      name: 'Premium Cotton Fabric',
      category: 'Fabrics',
      purchasePrice: 150,
      sellingPrice: 200,
      stock: 500
    }
  });

  // Create Customer
  const customer = await prisma.customer.upsert({
    where: { phone: '01700000000' },
    update: {},
    create: {
      name: 'Rahim Store',
      phone: '01700000000',
      shopName: 'Rahim Trading Inc.',
      shopAddress: 'Mirpur 10, Dhaka'
    }
  });

  // Create Supplier
  const supplier = await prisma.supplier.upsert({
    where: { phone: '01800000000' },
    update: {},
    create: {
      name: 'ABC Textiles',
      phone: '01800000000',
      company: 'ABC Group',
      address: 'NarayanGanj'
    }
  });

  // Create Sale
  const sale = await prisma.sale.upsert({
    where: { memoNo: 'INV-1001' },
    update: {},
    create: {
      memoNo: 'INV-1001',
      customerId: customer.id,
      subTotal: 2000,
      discount: 100,
      totalAmount: 1900,
      paidAmount: 1500,
      dueAdded: 400,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 10,
            price: 200,
            costPrice: 150
          }
        ]
      }
    }
  });

  console.log('Dummy data seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
