import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import { TPO } from "../models/tpoModel.js";
import { sendVerificationCode } from "../utils/verifyEmail/email.js";
import { sentRegisteredEmail } from "../utils/registeredUser/register.js";
import cloudinary from "cloudinary";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role, enrollment, address } = req.body;

  if (!name || !email || !phone || !password || !role || !address) {
    return next(new ErrorHandler("Please fill the complete form!"));
  }

  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    enrollment,
    address,
    isVerified: true,
  });

  sendToken(user, 201, res, "User Registered Successfully!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role, verificationCode } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password.", 400));
  }

  // Email verification removed: any account with correct email + password can log in.
  if (user.isVerified === false) {
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
  }

  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// verification code controller
export const verifyUser = catchAsyncErrors(async (req, res, next) => {
  const { verificationCode, email } = req.body;
  if (!verificationCode || !email) {
    return next(new ErrorHandler("Please provide verification code."));
  }
  // console.log(verificationCode, email);

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  if (user.verificationCode !== verificationCode) {
    return next(new ErrorHandler("Invalid verification code.", 400));
  }

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();

  sentRegisteredEmail(user);

  sendToken(user, 201, res, "User Registered Successfully!");
});

// generate verification code and send it to the user's email while login
export const generateVerificationCode = catchAsyncErrors(
  async (req, res, next) => {
    const { email } = req.body;

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }
    user.verificationCode = verificationCode;
    await user.save();
    sendVerificationCode(email, verificationCode);
    res.status(200).json({
      success: true,
      message: "Verification code sent to your email. Please check your inbox.",
    });
  }
);

  export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if (!verificationCode) {
    return next(new ErrorHandler("Verification code is required.", 400));
  }
    if (user.verificationCode === verificationCode) {
      res.status(200).json({
        success: true,
        message: "Verification code is correct.",
      });
  }
    
  });

export const generateNewPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, newPassword, verificationCode } = req.body;
  if (!email || !newPassword || !verificationCode) {
    return next(
      new ErrorHandler("Email, verification code and new password are required.", 400)
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
      return next(new ErrorHandler("User not found.", 404));
  }
  // Reject if no code was ever issued, or if it doesn't match
  if (!user.verificationCode || user.verificationCode !== verificationCode) {
    return next(new ErrorHandler("Invalid or expired verification code.", 400));
  }
  user.password = newPassword;
  user.verificationCode = null; // single-use: burn the code after reset
  await user.save();
  sendToken(user, 201, res, "Password updated successfully.");
});

// update password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  // console.log(oldPassword, newPassword);
  

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Old password and new password are required.", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect.", 400));
  }

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res, "Password updated successfully.");
});

// ---------- Profile management ----------

// PUT /api/v1/user/update-profile  — edit basic details (not email/role)
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, phone, address, enrollment } = req.body;

  if (!name || !phone || !address) {
    return next(new ErrorHandler("Name, phone and address are required.", 400));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  user.name = name;
  user.phone = phone;
  user.address = address;
  if (user.role === "Student" && enrollment !== undefined) {
    user.enrollment = enrollment;
  }
  await user.save();

  res.status(200).json({
    success: true,
    user,
    message: "Profile updated successfully!",
  });
});

// Shared upload helper: validates, uploads to Cloudinary, deletes the old asset
const uploadUserFile = async (file, existing, folder) => {
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(file.mimetype)) {
    throw new ErrorHandler(
      "Invalid file type. Please upload a PNG, JPEG or WEBP file.",
      400
    );
  }

  const uploaded = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder,
  });
  if (!uploaded || uploaded.error) {
    throw new ErrorHandler("File upload failed. Please try again.", 500);
  }

  // Remove the previous file so Cloudinary storage doesn't pile up
  if (existing?.public_id) {
    try {
      await cloudinary.v2.uploader.destroy(existing.public_id);
    } catch (e) {
      // Old file cleanup failing shouldn't break the new upload
      console.error("Cloudinary cleanup failed:", e?.message);
    }
  }

  return { public_id: uploaded.public_id, url: uploaded.secure_url };
};

// PUT /api/v1/user/upload-resume  — Students save one reusable resume
export const uploadResume = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Student") {
    return next(new ErrorHandler("Only students can upload a resume.", 400));
  }
  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Resume file required!", 400));
  }

  const user = await User.findById(req.user._id);
  user.resume = await uploadUserFile(
    req.files.resume,
    user.resume,
    "placement-portal/resumes"
  );
  await user.save();

  res.status(200).json({
    success: true,
    user,
    message: "Resume saved! It will be pre-filled when you apply.",
  });
});

// PUT /api/v1/user/upload-avatar  — profile picture for any user
export const uploadProfilePicture = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.avatar) {
    return next(new ErrorHandler("Profile picture file required!", 400));
  }

  const user = await User.findById(req.user._id);
  user.profilePicture = await uploadUserFile(
    req.files.avatar,
    user.profilePicture,
    "placement-portal/avatars"
  );
  await user.save();

  res.status(200).json({
    success: true,
    user,
    message: "Profile picture updated!",
  });
});
