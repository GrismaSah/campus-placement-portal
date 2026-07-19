import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import { StatusBadge, STATUS_OPTIONS } from "./statusBadge.jsx";

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const { jobId } = useParams();
  console.log(jobId);

  useEffect(() => {
    try {
      axios
        .get(
          "/api/v1/application/TNP/getall?jobId=" + jobId,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          console.log("response", res);

          setApplications(res.data.applications);
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `/api/v1/application/status/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success(data.message);
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <h1>Applications From Students</h1>
        {applications.length <= 0 ? (
          <>
            <h4>No Applications Found</h4>
          </>
        ) : (
          applications.map((element) => {
            return (
              <TNPCard
                element={element}
                key={element._id}
                openModal={openModal}
                updateStatus={updateStatus}
              />
            );
          })
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default JobApplications;

const TNPCard = ({ element, openModal, updateStatus }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Status:</span> <StatusBadge status={element.status} />
          </p>
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
          />
        </div>
        <div
          className="btn_area"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <label style={{ fontWeight: 600 }}>Update status:</label>
          <select
            value={element.status || "Applied"}
            onChange={(e) => updateStatus(element._id, e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccd4de",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};