import mysql from 'mysql2/promise';

async function migratePosts() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Starting post migration...');
    
    // Get all messages that don't have a title yet
    const [messages] = await connection.query(
      'SELECT id, content, title FROM messages WHERE title IS NULL OR title = ""'
    );
    
    console.log(`Found ${messages.length} posts to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const message of messages) {
      // Skip if content doesn't have the pattern (e.g., single line posts)
      if (!message.content.includes('\n\n')) {
        console.log(`Skipping message ${message.id} - no clear title/content split`);
        skipped++;
        continue;
      }
      
      // Split content into title and body
      const parts = message.content.split('\n\n');
      const title = parts[0].replace(/^#+\s*/, '').trim(); // Remove markdown heading syntax if present
      const content = parts.slice(1).join('\n\n').trim();
      
      // Only migrate if we have both title and content
      if (title && content) {
        await connection.query(
          'UPDATE messages SET title = ?, content = ? WHERE id = ?',
          [title, content, message.id]
        );
        console.log(`✓ Migrated message ${message.id}: "${title.substring(0, 50)}..."`);
        migrated++;
      } else {
        console.log(`Skipping message ${message.id} - couldn't extract valid title/content`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`  Migrated: ${migrated} posts`);
    console.log(`  Skipped: ${skipped} posts`);
    
  } catch (error) {
    console.error('Error migrating posts:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migratePosts().catch(console.error);
