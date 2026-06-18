import mongoose, { Document, Schema } from 'mongoose';

export interface IStaffDocument {
  url: string;
  publicId: string;
}

export interface IStaff extends Document {
  name: string;
  age: number;
  role: 'registered_nurse' | 'general_dr' | 'assistant_nurse';
  profileImage?: IStaffDocument;
  aclsCertificate?: IStaffDocument;
  blsCertificate?: IStaffDocument;
  vaccination?: IStaffDocument;
  infectionControlCertificate?: IStaffDocument;
  copyId?: IStaffDocument;
  idNumber: string;
  copyPassport?: IStaffDocument;
  passportPhoto?: IStaffDocument;
  emiratesId?: IStaffDocument;
  createdAt: Date;
  updatedAt: Date;
}

const staffDocumentSchema = new Schema<IStaffDocument>(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const staffSchema = new Schema<IStaff>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['registered_nurse', 'general_dr', 'assistant_nurse'],
    },
    idNumber: {
      type: String,
      required: [true, 'ID Number is required'],
      trim: true,
    },
    profileImage: staffDocumentSchema,
    aclsCertificate: staffDocumentSchema,
    blsCertificate: staffDocumentSchema,
    vaccination: staffDocumentSchema,
    infectionControlCertificate: staffDocumentSchema,
    copyId: staffDocumentSchema,
    copyPassport: staffDocumentSchema,
    passportPhoto: staffDocumentSchema,
    emiratesId: staffDocumentSchema,
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>('Staff', staffSchema);
