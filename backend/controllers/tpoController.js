import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { TPO } from  "../models/tpoModel.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import { User } from "../models/userSchema.js";
import { sendVerificationCode } from "../utils/verifyEmail/email.js";
import { sentRegisteredEmail } from "../utils/registeredUser/register.js";
import { sendTnpStatusEmailApproved, sendTnpStatusEmailDeclined } from "../utils/sendTnpStatusEmail.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";

export const registerTPO = catchAsyncErrors(async (req, res, next) => {
    const { firstname, lastname, email, phone, password } = req.body;
    // console.log(req.body);
    

  if (!firstname || !lastname || !email || !phone || !password ) {
    return next(new ErrorHandler("Please fill all required fields!"));
  }

  const isEmail = await TPO.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const tpo = await TPO.create({
    firstname,
    lastname,
    email,
    phone,
    password,
    isVerified: true,
  });

  sendToken(tpo, 201, res, "TPO Registered Successfully!");
});

export const loginTPO = catchAsyncErrors(async (req, res, next) => {
  const { email, password, verificationCode } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password."));
  }

  const tpo = await TPO.findOne({ email }).select("+password");
  if (!tpo) {
    return next(new ErrorHandler("Invalid Email.", 400));
  }
  const isPasswordMatched = await tpo.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password.", 400));
  }
  // Email verification removed: correct email + password is enough.
  if (tpo.isVerified === false) {
    tpo.isVerified = true;
    tpo.verificationCode = null;
    await tpo.save();
  }

  sendToken(tpo, 200, res, "TPO Logged In!");
});

export const logoutTPO = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
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


export const handleTNPRequest = catchAsyncErrors(async (req, res, next) => {
    const { userId, action } = req.body;
  
    
    if (!userId || !["Approved", "Declined"].includes(action)) {
      return next(new ErrorHandler("Invalid input!"));
    }
  
    const user = await User.findById(userId);
    if (!user || user.role !== "TNP") {
      return next(new ErrorHandler("TNP user not found!"));
    }
  
  user.status = action;
  
    await user.save();
  
  if (action === "Approved") {
    sendTnpStatusEmailApproved(user)
      res.status(200).json({ success: true, message: "TNP registration approved!" });
  } else {
    sendTnpStatusEmailDeclined(user);
      res.status(200).json({ success: true, message: "TNP registration declined. Functionality hidden." });
    }
  });
  

  export const getPendingTNPs = catchAsyncErrors(async (req, res, next) => {
    
    const pendingTNPs = await User.find({ role: "TNP", status: "Pending" });
  
    if (!pendingTNPs || pendingTNPs.length === 0) {
      return next(new ErrorHandler("No pending TNPs found!", 404));
    }
  
   
    res.status(200).json({
      success: true,
      count: pendingTNPs.length,
      pendingTNPs,
    });
  });

  export const getTPO = catchAsyncErrors((req, res, next) => {
    const user = req.user;
    console.log(user);
    
    res.status(200).json({
      success: true,
      user,
    });
  });


  // verification code controller
export const verifyUserTPO = catchAsyncErrors(async (req, res, next) => {
  const { verificationCode, email } = req.body;

  const user = await TPO.findOne({ email });
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
export const generateVerificationCodeTPO = catchAsyncErrors(
  async (req, res, next) => {
    const { email } = req.body;

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const user = await TPO.findOne({ email });
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

export const forgotPasswordTPO = catchAsyncErrors(async (req, res, next) => {
  const { email, verificationCode } = req.body;
  const user = await TPO.findOne({ email });
if (!user) {
  return next(new ErrorHandler("User not found.", 404));
}

if (!verificationCode) {
  return next(new ErrorHandler("Verification code is required.", 400));
}
  if (user.verificationCode === verificationCode) {
    return res.status(200).json({
      success: true,
      message: "Verification code is correct.",
    });
  }
  return next(new ErrorHandler("Invalid verification code.", 400));
});

export const generateNewPasswordTPO = catchAsyncErrors(async (req, res, next) => {
const { email, newPassword, verificationCode } = req.body;
if (!email || !newPassword || !verificationCode) {
  return next(
    new ErrorHandler("Email, verification code and new password are required.", 400)
  );
}
const user = await TPO.findOne({ email });
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

export const updatePasswordTPO = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await TPO.findById(req.user._id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect.", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 201, res, "Password updated successfully.");
});
// GET /api/v1/tpo/dashboard-stats — aggregated platform metrics for the admin dashboard
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const [
    students,
    tnpsApproved,
    tnpsPending,
    totalJobs,
    openJobs,
    totalApplications,
    applicationsByStatus,
    jobsByCategory,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "TNP", status: "Approved" }),
    User.countDocuments({ role: "TNP", status: "Pending" }),
    Job.countDocuments(),
    Job.countDocuments({ expired: false }),
    Application.countDocuments(),
    Application.aggregate([
      // Applications created before the status feature have no status field
      { $group: { _id: { $ifNull: ["$status", "Applied"] }, count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    Job.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      students,
      tnpsApproved,
      tnpsPending,
      totalJobs,
      openJobs,
      totalApplications,
      applicationsByStatus,
      jobsByCategory,
    },
  });
});
