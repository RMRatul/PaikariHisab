const { PrismaClient } = require("./src/generated/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { username },
    update: { password: hashedPassword },
    create: {
      username,
      password: hashedPassword,
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  console.log("-----------------------------------------");
  console.log("INITIAL ADMIN CREDENTIALS CREATED:");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
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
