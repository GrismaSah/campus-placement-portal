import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";

// GET /api/v1/stats  — public, real-time platform statistics
export const getStats = catchAsyncErrors(async (req, res, next) => {
  const [studentsRegistered, jobsPosted, openJobs, applications, companies] =
    await Promise.all([
      User.countDocuments({ role: "Student" }),
      Job.countDocuments(),
      Job.countDocuments({ expired: false }),
      Application.countDocuments(),
      Job.distinct("company"),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      studentsRegistered,
      jobsPosted,
      openJobs,
      applications,
      companies: companies.length,
    },
  });
});
