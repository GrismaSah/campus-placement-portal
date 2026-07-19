import React, { useEffect, useState } from "react";
import { FaBuilding, FaSuitcase, FaUsers, FaFileAlt } from "react-icons/fa";
import axios from "axios";

const HeroSection = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/v1/stats");
        setStats(data.stats);
      } catch (error) {
        // If the stats API is unreachable, keep the section hidden values as 0
        setStats(null);
      }
    };
    fetchStats();
  }, []);

  const details = [
    {
      id: 1,
      title: stats ? stats.studentsRegistered : "—",
      subTitle: "Students Registered",
      icon: <FaUsers />,
    },
    {
      id: 2,
      title: stats ? stats.openJobs : "—",
      subTitle: "Open Positions",
      icon: <FaSuitcase />,
    },
    {
      id: 3,
      title: stats ? stats.companies : "—",
      subTitle: "Companies Hiring",
      icon: <FaBuilding />,
    },
    {
      id: 4,
      title: stats ? stats.applications : "—",
      subTitle: "Applications Submitted",
      icon: <FaFileAlt />,
    },
  ];

  return (
    <>
      <div id="home" className="heroSection">
        <div className="container">
          <div className="title">
            <h1>Launch Your Career</h1>
            <h1>Through Campus Placements</h1>
            <p>
              Unlock your potential and secure your dream job through our premier campus placement platform. 
              Connect with top companies, showcase your talents, and take the first step towards your 
              professional success.
            </p>
          </div>
          <div className="image">
            <img src="/heroS.jpg" alt="hero" />
          </div>
        </div>
        <div className="details">
          {details.map((element) => {
            return (
              <div className="card" key={element.id}>
                <div className="icon">{element.icon}</div>
                <div className="content">
                  <p>{element.title}</p>
                  <p>{element.subTitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HeroSection;
