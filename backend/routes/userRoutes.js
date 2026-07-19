import express from "express";
import { login, register, logout, getUser, verifyUser, generateVerificationCode, forgotPassword, generateNewPassword, updatePassword, updateProfile, uploadResume, uploadProfilePicture } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyUser);
router.post("/generate-code", generateVerificationCode);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/generate-new-password", generateNewPassword);
router.post("/update-password", isAuthenticated, updatePassword);
router.put("/update-profile", isAuthenticated, updateProfile);
router.put("/upload-resume", isAuthenticated, uploadResume);
router.put("/upload-avatar", isAuthenticated, uploadProfilePicture);

export default router;