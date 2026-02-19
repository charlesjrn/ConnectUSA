import { selectWeeklyMember } from './server/weeklyMemberSelection.js';

console.log('=== Testing Automatic Weekly Member Selection ===\n');

try {
  const result = await selectWeeklyMember();
  
  console.log('\n=== Selection Result ===');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Selection successful!');
    console.log(`   Member: ${result.member.name}`);
    console.log(`   Testimonies: ${result.member.testimonyCount}`);
    console.log(`   Likes: ${result.member.totalLikes}`);
  } else {
    console.log('\n❌ Selection failed');
    console.log(`   Reason: ${result.reason}`);
  }
} catch (error) {
  console.error('\n❌ Error during test:', error);
  process.exit(1);
}
