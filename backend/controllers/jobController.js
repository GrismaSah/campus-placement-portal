import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import transporter from "../utils/email.config.js";
import { NewJobPostedNotificationTemplate } from "../utils/NewJobPostedNotificationTemplate.js";
import { User } from "../models/userSchema.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Student") {
    return next(
      new ErrorHandler("Student not allowed to access this resource.", 400)
    );
  }
  const {
    title,
    description,
    category,
    country,
    city,
    company,
    fixedSalary,
    salaryFrom,
    salaryTo,
  } = req.body;

  if (!title || !description || !category || !country || !city || !company) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary.",
        400
      )
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400)
    );
  }
  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    company,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
  });


  
  
    
  const students = await User.find({ role: "Student" }, "email name"); // Correct query method
  if (!students || students.length === 0) {
    console.log("No students found to notify.");
  } else {
    console.log(".env email", process.env.NODEMAIL_EMAIL);
    
    for (const student of students) {
      const mailOptions = {
        from: `"NITA-PLACEMENT-CELL" <${process.env.NODEMAIL_EMAIL}>`,
        to: student.email,
        subject: "New Job Posted",
        html: NewJobPostedNotificationTemplate(job, student.name), // Ensure 'job' is passed correctly
      };
      
      try {
        await transporter.sendMail(mailOptions);
        // console.log(`Notification sent to ${student.email}`);
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error.message);
      }
    }
  }
  
    
  
  
  
  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role === "Student") {
    return next(
      new ErrorHandler("Students not allowed to access this resource.", 400)
    );
  }

  const myJobs = await Job.find({ postedBy: req.user._id });

  // Fetch application counts for each job
  const jobIds = myJobs.map((job) => job._id);
  const applicationCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);

  // Map counts to the jobs
  const jobsWithCounts = myJobs.map((job) => {
    const applicationCount =
      applicationCounts.find((app) => String(app._id) === String(job._id))
        ?.count || 0;
    return { ...job.toObject(), applicationCount };
  });

  res.status(200).json({
    success: true,
    myJobs: jobsWithCounts,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Student") {
    return next(
      new ErrorHandler("Student not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Job Updated!",
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Student") {
    return next(
      new ErrorHandler("Student not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted!",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id).populate("postedBy", "name email phone");
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  }
});
