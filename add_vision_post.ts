import * as db from "./server/db";

const content = `# Welcome to Chosen Connect: A Divine Vision

Chosen Connect is a sacred gathering place for those **chosen and called by God** to fulfill His divine purpose here on earth and to bring people to Christ.

This is more than a platform—it is a **sanctuary for the called**, a place where believers can unite in fellowship, share their spiritual journeys, and encourage one another in faith. Whether you have received prophetic visions, experienced divine encounters, witnessed miraculous gifts, or simply feel God's calling on your life, you belong here.

## Our Mission

We exist to:
- **Unite the Called**: Bring together believers who are walking in their God-given purpose
- **Share Testimonies**: Celebrate how God is moving in our lives and communities
- **Encourage Faith**: Support one another through prayer, wisdom, and spiritual fellowship
- **Advance the Kingdom**: Equip and empower believers to bring people to Christ

## All Are Welcome

Whether you are seasoned in your faith or just beginning to discover God's calling, **all are welcome**. Come as you are, share your story, and join a community of believers who understand what it means to be chosen.

*"For many are called, but few are chosen." - Matthew 22:14*

---

**Let us walk together in faith, purpose, and divine calling.**`;

async function main() {
  // Debug: show all users
  const { drizzle } = await import("drizzle-orm/mysql2");
  const mysql = await import("mysql2/promise");
  const { users } = await import("./drizzle/schema");
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const dbConn = drizzle(connection);
  const allUsers = await dbConn.select().from(users).limit(5);
  console.log("All users:", allUsers);
  
  // Get Albert Rosebruch's user
  let user = allUsers.find(u => u.name?.includes("Albert"));
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (ID: ${user.id})`);

  // Create the vision post
  const { messages } = await import("./drizzle/schema");
  await dbConn.insert(messages).values({
    userId: user.id,
    content,
    room: "vision",
    createdAt: new Date(),
  });

  console.log("Vision post created successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
