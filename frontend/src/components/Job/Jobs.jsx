import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Jobs.css";

export const JOB_CATEGORIES = [
  "Data Analyst",
  "Mobile App Development",
  "Frontend Development",
  "Web Development",
  "Account & Finance",
  "System Engineer",
  "Graduate Trainee",
  "Data Scientist",
  "Machine Learning",
  "BDA",
];

const Jobs = () => {
  // URL is the single source of truth for filters -> shareable links,
  // working back button, and home-page category cards can deep-link here.
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Local input state (only applied to the URL when user hits Search)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minSalary, setMinSalary] = useState(searchParams.get("minSalary") || "");
  const [maxSalary, setMaxSalary] = useState(searchParams.get("maxSalary") || "");

  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/v1/job/getall", {
          params: Object.fromEntries(searchParams.entries()),
          withCredentials: true,
        });
        setJobs(data.jobs || []);
        setTotalJobs(data.totalJobs || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [searchParams]);

  // Helper: update URL params (resetting to page 1 whenever filters change)
  const applyParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!("page" in updates)) next.delete("page");
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyParams({ keyword, city, minSalary, maxSalary });
  };

  const clearFilters = () => {
    setKeyword("");
    setCity("");
    setMinSalary("");
    setMaxSalary("");
    setSearchParams({});
  };

  const goToPage = (p) => {
    applyParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatSalary = (job) => {
    if (job.fixedSalary) return `₹${job.fixedSalary.toLocaleString("en-IN")}`;
    if (job.salaryFrom && job.salaryTo)
      return `₹${job.salaryFrom.toLocaleString("en-IN")} – ₹${job.salaryTo.toLocaleString("en-IN")}`;
    return "Not disclosed";
  };

  const hasActiveFilters =
    keyword || city || minSalary || maxSalary || category || searchParams.get("keyword");

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>

        {/* Search + filter bar */}
        <form className="jobFilters" onSubmit={handleSearch}>
          <div className="filterRow">
            <input
              type="text"
              placeholder="Search title, company or keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => applyParams({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="filterRow">
            <input
              type="number"
              min="0"
              placeholder="Min salary (₹)"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max salary (₹)"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
            />
            <button type="submit" className="searchBtn">
              <FaSearch /> Search
            </button>
            {hasActiveFilters && (
              <button type="button" className="clearBtn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Result count */}
        {!loading && (
          <p className="resultCount">
            {totalJobs === 0
              ? "No jobs found"
              : `${totalJobs} job${totalJobs === 1 ? "" : "s"} found${
                  category ? ` in ${category}` : ""
                }`}
          </p>
        )}

        {/* Job cards */}
        <div className="banner">
          {loading ? (
            <p className="jobsMessage">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="jobsMessage">
              No jobs match your filters. Try clearing some filters.
            </p>
          ) : (
            jobs.map((element) => (
              <div className="card" key={element._id}>
                <p className="jobTitle">{element.title}</p>
                <p>{element.company}</p>
                <p className="jobMeta">
                  {element.category} • {element.city}
                </p>
                <p className="jobSalary">{formatSalary(element)}</p>
                <Link to={`/job/${element._id}`}>Job Details</Link>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === page ? "activePage" : ""}
                onClick={() => goToPage(p)}
                disabled={p === page}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobs;
