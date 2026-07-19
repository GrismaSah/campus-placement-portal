import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCamera, FaFileUpload, FaExternalLinkAlt } from "react-icons/fa";
import { Context } from "../../main";
import "./Profile.css";

const Profile = () => {
  const { user, setUser } = useContext(Context);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [enrollment, setEnrollment] = useState(user?.enrollment || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const isStudent = user?.role === "Student";

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(
        "/api/v1/user/update-profile",
        { name, phone, address, enrollment },
        { withCredentials: true }
      );
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axios.put("/api/v1/user/upload-avatar", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const { data } = await axios.put("/api/v1/user/upload-resume", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  return (
    <section className="profile page">
      <div className="profileContainer">
        <h1>My Profile</h1>

        {/* ---- Avatar ---- */}
        <div className="avatarSection">
          <div className="avatarWrap" onClick={() => avatarInputRef.current.click()}>
            {user?.profilePicture?.url ? (
              <img src={user.profilePicture.url} alt="profile" />
            ) : (
              <span className="avatarInitial">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="avatarOverlay">
              <FaCamera />
            </div>
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            hidden
          />
          <p className="avatarHint">
            {uploadingAvatar ? "Uploading..." : "Click the photo to change it"}
          </p>
          <span className={`roleBadge ${isStudent ? "student" : "tnp"}`}>
            {user?.role}
          </span>
        </div>

        {/* ---- Details form ---- */}
        <form className="profileForm" onSubmit={handleSaveDetails}>
          <div className="fieldRow">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Email (cannot be changed)</label>
              <input type="email" value={user?.email || ""} disabled />
            </div>
          </div>
          <div className="fieldRow">
            <div className="field">
              <label>Phone</label>
              <input
                type="number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {isStudent && (
              <div className="field">
                <label>Enrollment Number</label>
                <input
                  type="text"
                  value={enrollment}
                  onChange={(e) => setEnrollment(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="field">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* ---- Resume (students only) ---- */}
        {isStudent && (
          <div className="resumeSection">
            <h2>My Resume</h2>
            {user?.resume?.url ? (
              <div className="resumeCard">
                <img src={user.resume.url} alt="resume preview" />
                <div className="resumeActions">
                  <a href={user.resume.url} target="_blank" rel="noreferrer">
                    <FaExternalLinkAlt /> View full size
                  </a>
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current.click()}
                    disabled={uploadingResume}
                  >
                    <FaFileUpload />{" "}
                    {uploadingResume ? "Uploading..." : "Replace Resume"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="resumeEmpty">
                <p>
                  No resume saved yet. Save one here and it will be used
                  automatically when you apply for jobs.
                </p>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current.click()}
                  disabled={uploadingResume}
                >
                  <FaFileUpload />{" "}
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              ref={resumeInputRef}
              onChange={handleResumeChange}
              hidden
            />
            <p className="resumeHint">
              Accepted formats: PNG, JPEG, WEBP (image of your resume)
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
