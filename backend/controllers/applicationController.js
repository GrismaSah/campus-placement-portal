import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;

  if (role === "TNP") {
    return next(
      new ErrorHandler("TNP not allowed to access this resource.", 400)
    );
  }

  // Resume source: a freshly uploaded file, OR the student's saved profile resume
  let resumeData = null;

  if (req.files && req.files.resume) {
    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
      );
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
    }
    resumeData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  } else if (req.user.resume && req.user.resume.url) {
    // Reuse the resume saved on the student's profile
    resumeData = {
      public_id: req.user.resume.public_id,
      url: req.user.resume.url,
    };
  } else {
    return next(
      new ErrorHandler(
        "Resume required! Upload a file or save one on your profile first.",
        400
      )
    );
  }

  const { name, email, coverLetter, phone, address, jobId, enrollment } =
    req.body;
  const applicantID = {
    user: req.user._id,
    role: "Student",
  };

  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const TNPID = {
    user: jobDetails.postedBy,
    role: "TNP",
  };

  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !TNPID ||
    !resumeData ||
    !enrollment
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const existingApplication = await Application.findOne({
    "applicantID.user": req.user._id,
    jobId,
  });

  if (existingApplication) {
    return next(
      new ErrorHandler(
        "You have already submitted an application for this job.",
        400
      )
    );
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    enrollment,
    address,
    applicantID,
    TNPID,
    jobId,
    resume: resumeData,
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const TNPGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Student") {
      return next(
        new ErrorHandler("Students not allowed to access this resource.", 400)
      );
    }
    const { jobId } = req.query;
    const { _id } = req.user;
    const applications = await Application.find({ jobId: jobId });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "TNP") {
      return next(
        new ErrorHandler("TNP not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({
      "applicantID.user": _id,
    }).populate(
      "jobId",
      "company jobPostedOn title category country city location"
    );
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "TNP") {
      return next(
        new ErrorHandler("TNP not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

// export const getApplicationsCount = async (req, res) => {
//     try {
//         const { jobId } = req.params;
//         const count = await Job.countDocuments({ jobId });
//         return res.status(200).json({ jobId, count });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error fetching application count', error });
//     }
// };

// PUT /api/v1/application/status/:id  — TNP moves an application through the workflow
export const updateApplicationStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role !== "TNP") {
      return next(
        new ErrorHandler("Only TNP can update application status.", 403)
      );
    }

    const { status } = req.body;
    const allowedStatuses = ["Applied", "Shortlisted", "Selected", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status value.", 400));
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new ErrorHandler("Application not found.", 404));
    }

    // Ownership check: a TNP may only update applications for jobs THEY posted.
    if (application.TNPID.user.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler(
          "You can only update applications for your own job postings.",
          403
        )
      );
    }

    application.status = status;
    application.statusUpdatedAt = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application,
    });
  }
);
