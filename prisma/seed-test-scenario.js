const { PrismaClient } = require("../src/generated/client");

const db = new PrismaClient();

async function main() {
  console.log("🚀 Starting Real-Value Integration Test Scenario...");

  // 1. Setup Supplier
  const supplier = await db.supplier.upsert({
    where: { id: "test-supplier-1" },
    update: {},
    create: {
      id: "test-supplier-1",
      name: "TexWorld Textile Mill",
      phone: "01999888777",
      company: "Modina Group",
      address: "Narsingdi, Bangladesh",
      dueBalance: 0
    }
  });

  // 2. Setup Products
  const panjabi = await db.product.upsert({
    where: { code: "PJ-001" },
    update: { stock: 100 },
    create: {
      code: "PJ-001",
      name: "Cotton Panjabi V1 (Sky Blue)",
      category: "Garments",
      purchasePrice: 500,
      sellingPrice: 1200,
      stock: 100
    }
  });

  const saree = await db.product.upsert({
    where: { code: "SR-502" },
    update: { stock: 50 },
    create: {
      code: "SR-502",
      name: "Jamdani Silk Saree (Premium)",
      category: "Saree",
      purchasePrice: 2500,
      sellingPrice: 4800,
      stock: 50
    }
  });

  // 3. Setup Customers
  const vipCustomer = await db.customer.upsert({
    where: { phone: "01711223344" },
    update: { dueBalance: 0 },
    create: {
      name: "Modina Garments & Fashion",
      phone: "01711223344",
      shopName: "Modina Fashion Hub",
      shopAddress: "Bongo Bazar, Dhaka",
      dueBalance: 0
    }
  });

  const riskyCustomer = await db.customer.upsert({
    where: { phone: "01822334455" },
    update: { dueBalance: 45000 },
    create: {
      name: "Old Dhaka Retailer (Bad Balance Demo)",
      phone: "01822334455",
      shopName: "Retailer X",
      shopAddress: "Chawkbazar, Dhaka",
      dueBalance: 45000 // Injected high debt to test "Risky" tag
    }
  });

  // 4. Simulate a Sale for VIP Candidate
  // Modina buys 10 Panjabis and 2 Sarees
  const saleSubTotal = (10 * 1200) + (2 * 4800); // 12000 + 9600 = 21600
  const salePaid = 15000;
  const saleDue = saleSubTotal - salePaid; // 6600

  const sale = await db.sale.create({
    data: {
      customerId: vipCustomer.id,
      date: new Date(),
      subTotal: saleSubTotal,
      discount: 0,
      totalAmount: saleSubTotal,
      paidAmount: salePaid,
      dueAdded: saleDue,
      memoNo: "TEST-INV-001",
      items: {
        create: [
          { productId: panjabi.id, quantity: 10, price: 1200, costPrice: 500 },
          { productId: saree.id, quantity: 2, price: 4800, costPrice: 2500 }
        ]
      }
    }
  });

  await db.customer.update({
     where: { id: vipCustomer.id },
     data: { dueBalance: { increment: saleDue } }
  });

  // 5. Simulate a Return
  // Modina returns 1 Saree
  const returnAmount = 4800;
  const returnEntry = await db.return.create({
    data: {
        customerId: vipCustomer.id,
        totalAmount: returnAmount,
        reason: "Color Mismatch (SQA Test)",
        items: {
            create: [
                { productId: saree.id, quantity: 1, refundPrice: 4800 }
            ]
        }
    }
  });

  // Reconcile Stock and Balance
  await db.product.update({ where: { id: saree.id }, data: { stock: { increment: 1 } } });
  await db.customer.update({ where: { id: vipCustomer.id }, data: { dueBalance: { decrement: returnAmount } } });

  console.log("✅ Success: Real-Value Scenario Injected.");
  console.log("-----------------------------------------");
  console.log("DATA SUMMARY:");
  console.log("- VIP Target: Modina Garments (Check ranking logic)");
  console.log("- Risky Target: Old Dhaka Retailer (Check ShieldAlert)");
  console.log("- Net Worth: Should include stock assets + receivables + cash inflow.");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
