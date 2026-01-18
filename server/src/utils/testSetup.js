import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Setup the test database with test users
 */
export const setupTestDb = async () => {
  try {
    // Create a test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { username: 'admin_test' },
      update: {},
      create: {
        email: 'admin@test.com',
        username: 'admin_test',
        password: adminPassword,
        role: 'ADMIN'
      }
    });

    // Create a test regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await prisma.user.upsert({
      where: { username: 'user_test' },
      update: {},
      create: {
        email: 'user@test.com',
        username: 'user_test',
        password: userPassword,
        role: 'USER'
      }
    });
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
};

/**
 * Clean up test data after tests
 */
export const cleanupTestDb = async () => {
  try {
    // Delete test users by username or email
    await prisma.user.deleteMany({
      where: {
        OR: [
          {
            username: {
              in: [
                'admin_test', 
                'user_test', 
                'newuser', 
                'auto_username', 
                'duplicate_user',
                'login_test',
                'protected_user',
                'admin_user'
              ]
            }
          },
          {
            email: {
              in: [
                'admin@test.com', 
                'user@test.com', 
                'new@test.com',
                'auto_username@test.com',
                'duplicate@test.com',
                'login_test@example.com',
                'protected_test@example.com',
                'admin_test@example.com'
              ]
            }
          }
        ]
      }
    });
    
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
};

/**
 * Close Prisma client connection
 */
export const closePrismaConnection = async () => {
  await prisma.$disconnect();
};