import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUserGraduate,
  FaUserTie,
  FaUserClock,
  FaSuitcase,
  FaFolderOpen,
  FaFileAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";

const STATUS_COLORS = {
  Applied: "#4a90d9",
  Shortlisted: "#e0a800",
  Selected: "#1a9e5c",
  Rejected: "#d9534f",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingTNPs, setPendingTNPs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/tpo/dashboard-stats", {
        withCredentials: true,
      });
      setStats(data.stats);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard stats"
      );
    }
    try {
      const { data } = await axios.get("/api/v1/tpo/pending-tnps", {
        withCredentials: true,
      });
      setPendingTNPs(data.pendingTNPs || []);
    } catch (error) {
      // Backend returns 404 when there are no pending TNPs — that's fine
      setPendingTNPs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTNPRequest = async (userId, action) => {
    try {
      const { data } = await axios.post(
        "/api/v1/tpo/tnp-request",
        { userId, action },
        { withCredentials: true }
      );
      toast.success(data.message);
      setPendingTNPs((prev) => prev.filter((tnp) => tnp._id !== userId));
      // Refresh counters so Approved/Pending cards stay accurate
      const res = await axios.get("/api/v1/tpo/dashboard-stats", {
        withCredentials: true,
      });
      setStats(res.data.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <section className="tpoDashboard page">
        <p className="dashLoading">Loading dashboard...</p>
      </section>
    );
  }

  const cards = stats
    ? [
        { label: "Students", value: stats.students, icon: <FaUserGraduate /> },
        { label: "Approved TNPs", value: stats.tnpsApproved, icon: <FaUserTie /> },
        { label: "Pending TNPs", value: stats.tnpsPending, icon: <FaUserClock /> },
        { label: "Total Jobs", value: stats.totalJobs, icon: <FaSuitcase /> },
        { label: "Open Jobs", value: stats.openJobs, icon: <FaFolderOpen /> },
        {
          label: "Applications",
          value: stats.totalApplications,
          icon: <FaFileAlt />,
        },
      ]
    : [];

  return (
    <section className="tpoDashboard page">
      <div className="dashContainer">
        <h1>TPO Dashboard</h1>

        {/* ---- Stat cards ---- */}
        <div className="statCards">
          {cards.map((c) => (
            <div className="statCard" key={c.label}>
              <div className="statIcon">{c.icon}</div>
              <div>
                <p className="statValue">{c.value}</p>
                <p className="statLabel">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ---- Charts ---- */}
        {stats && (
          <div className="chartsRow">
            <div className="chartCard">
              <h2>Jobs by Category</h2>
              {stats.jobsByCategory.length === 0 ? (
                <p className="chartEmpty">No jobs posted yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={stats.jobsByCategory}
                    margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                  >
                    <XAxis
                      dataKey="category"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4a90d9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chartCard">
              <h2>Applications by Status</h2>
              {stats.applicationsByStatus.length === 0 ? (
                <p className="chartEmpty">No applications yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={stats.applicationsByStatus}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      label
                    >
                      {stats.applicationsByStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ---- Pending TNP approvals ---- */}
        <div className="pendingSection">
          <h2>Pending TNP Approvals</h2>
          {pendingTNPs.length === 0 ? (
            <p className="tableEmpty">
              No pending requests — all TNP accounts reviewed. ✔
            </p>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Requested On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTNPs.map((tnp) => (
                    <tr key={tnp._id}>
                      <td>{tnp.name}</td>
                      <td>{tnp.email}</td>
                      <td>{tnp.phone}</td>
                      <td>
                        {tnp.createdAt
                          ? new Date(tnp.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>
                        <div className="actionBtns">
                          <button
                            className="approveBtn"
                            onClick={() =>
                              handleTNPRequest(tnp._id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="declineBtn"
                            onClick={() =>
                              handleTNPRequest(tnp._id, "Declined")
                            }
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
