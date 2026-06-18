import mongoose from 'mongoose';
import User from '../models/user.model';

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dashboard.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword123';

  try {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Dashboard Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`👤 Seeded default admin user: ${adminEmail}`);
    }
  } catch (error: any) {
    console.error(`⚠️ Failed to seed default admin: ${error.message}`);
  }
};

let cachedConnection: typeof mongoose | null = null;

const connectDB = async (): Promise<void> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(dbUrl);
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin
    await seedAdminUser();
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
