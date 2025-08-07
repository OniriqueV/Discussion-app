import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');


  // Admin emails
  const adminEmails = [
    'phuong.cm@zinza.com.vn',
    'vietanh203fw@gmail.com'
  ];

  // Create admin users
  for (const email of adminEmails) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      // Generate a random password hash (since these will login via Google)
      const passwordHash = await bcrypt.hash('temp-password-' + Math.random(), 10);
      
      const adminUser = await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          full_name: email.includes('phuong') ? 'Phuong CM' : 'Viet Anh',
          role: 'admin',
          status: 'active',
        },
      });

      console.log('✅ Created admin user:', adminUser.email);
    } else {
      // Update existing user to admin if not already
      if (existingUser.role !== 'admin') {
        await prisma.user.update({
          where: { email },
          data: { 
            role: 'admin',
          },
        });
        console.log('✅ Updated user to admin:', email);
      } else {
        console.log('👤 Admin user already exists:', email);
      }
    }
  }

  // Create sample topics
  const topics = [
    { name: 'General Discussion', slug: 'general-discussion' },
    { name: 'Technical Support', slug: 'technical-support' },
    { name: 'Feature Requests', slug: 'feature-requests' },
    { name: 'Bug Reports', slug: 'bug-reports' },
  ];

  for (const topicData of topics) {
    await prisma.topic.upsert({
      where: { name: topicData.name },
      update: {},
      create: topicData,
    });
  }

  console.log('✅ Created sample topics');

  // Create sample tags
  const tags = [
    { name: 'urgent', slug: 'urgent' },
    { name: 'question', slug: 'question' },
    { name: 'solved', slug: 'solved' },
    { name: 'discussion', slug: 'discussion' },
    { name: 'help-needed', slug: 'help-needed' },
  ];

  for (const tagData of tags) {
    await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData,
    });
  }

  console.log('✅ Created sample tags');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });