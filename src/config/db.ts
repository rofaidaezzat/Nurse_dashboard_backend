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

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL as string);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin
    await seedAdminUser();
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
