import { Request, Response } from 'express';
import Staff from '../models/staff.model';
import cloudinary from '../config/cloudinary';
import 'multer';

// Helper to destroy a Cloudinary image by its publicId
const destroyCloudinaryImage = async (publicId: string | undefined): Promise<void> => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
    }
  }
};

// ─── GET /api/v1/staff ───────────────────────────────────────────────────────
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  const { role, page = 1, limit = 10, search } = req.query;

  const filter: Record<string, any> = {};
  if (role) filter.role = role;
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Staff.countDocuments(filter);
  const staffMembers = await Staff.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: staffMembers,
  });
};

// ─── GET /api/v1/staff/:id ───────────────────────────────────────────────────
export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  const staffMember = await Staff.findById(req.params.id);
  if (!staffMember) {
    res.status(404).json({ success: false, message: 'Staff member not found' });
    return;
  }
  res.status(200).json({ success: true, data: staffMember });
};

// ─── POST /api/v1/staff ──────────────────────────────────────────────────────
export const createStaff = async (req: Request, res: Response): Promise<void> => {
  const staffData: Record<string, any> = { ...req.body };

  // Parse uploaded files from multer fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  if (files) {
    const fileFields = [
      'profileImage',
      'aclsCertificate',
      'blsCertificate',
      'vaccination',
      'infectionControlCertificate',
      'copyId',
      'copyPassport',
      'passportPhoto',
      'emiratesId',
    ];

    for (const field of fileFields) {
      if (files[field] && files[field][0]) {
        staffData[field] = {
          url: files[field][0].path,
          publicId: files[field][0].filename,
        };
      }
    }
  }

  const staffMember = await Staff.create(staffData);
  res.status(201).json({ success: true, message: 'Staff member created successfully', data: staffMember });
};

// ─── PUT /api/v1/staff/:id ───────────────────────────────────────────────────
export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  const staffMember = await Staff.findById(req.params.id);
  if (!staffMember) {
    res.status(404).json({ success: false, message: 'Staff member not found' });
    return;
  }

  const updateData: Record<string, any> = { ...req.body };
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  if (files) {
    const fileFields = [
      'profileImage',
      'aclsCertificate',
      'blsCertificate',
      'vaccination',
      'infectionControlCertificate',
      'copyId',
      'copyPassport',
      'passportPhoto',
      'emiratesId',
    ];

    for (const field of fileFields) {
      if (files[field] && files[field][0]) {
        // Delete the old file from Cloudinary first if it exists
        const currentFile = (staffMember as any)[field];
        if (currentFile && currentFile.publicId) {
          await destroyCloudinaryImage(currentFile.publicId);
        }

        // Set the new file
        updateData[field] = {
          url: files[field][0].path,
          publicId: files[field][0].filename,
        };
      }
    }
  }

  const updatedStaffMember = await Staff.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Staff member updated successfully', data: updatedStaffMember });
};

// ─── DELETE /api/v1/staff/:id ────────────────────────────────────────────────
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  const staffMember = await Staff.findById(req.params.id);
  if (!staffMember) {
    res.status(404).json({ success: false, message: 'Staff member not found' });
    return;
  }

  // Delete all associated files from Cloudinary
  const fileFields = [
    'profileImage',
    'aclsCertificate',
    'blsCertificate',
    'vaccination',
    'infectionControlCertificate',
    'copyId',
    'copyPassport',
    'passportPhoto',
    'emiratesId',
  ];

  for (const field of fileFields) {
    const fileObj = (staffMember as any)[field];
    if (fileObj && fileObj.publicId) {
      await destroyCloudinaryImage(fileObj.publicId);
    }
  }

  await staffMember.deleteOne();
  res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
};

// ─── GET /api/v1/staff/dashboard/overview ────────────────────────────────────
export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
  const totalStaff = await Staff.countDocuments();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const addedThisMonth = await Staff.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  const latestStaff = await Staff.findOne()
    .sort({ createdAt: -1 })
    .select('name role createdAt');

  const registeredNurses = await Staff.countDocuments({ role: 'registered_nurse' });
  const assistantNurses = await Staff.countDocuments({ role: 'assistant_nurse' });
  const generalDocs = await Staff.countDocuments({ role: 'general_dr' });

  res.status(200).json({
    success: true,
    data: {
      totalStaff,
      addedThisMonth,
      latestRegistration: latestStaff
        ? {
            name: latestStaff.name,
            role: latestStaff.role,
            createdAt: latestStaff.createdAt,
          }
        : null,
      distribution: {
        registered_nurse: registeredNurses,
        assistant_nurse: assistantNurses,
        general_dr: generalDocs,
      },
    },
  });
};
