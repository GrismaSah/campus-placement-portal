import React from "react";
import { Link } from "react-router-dom";
import {
  MdOutlineDesignServices,
  MdOutlineWebhook,
  MdAccountBalance,
  MdOutlineAnimation,
} from "react-icons/md";
import { TbAppsFilled } from "react-icons/tb";
import { FaReact } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";

// `title` must exactly match the category values jobs are posted with
// (see the category <select> in PostJob.jsx) so the filter link works.
const PopularCategories = () => {
  const categories = [
    {
      id: 1,
      title: "Data Analyst",
      icon: <MdOutlineDesignServices />,
    },
    {
      id: 2,
      title: "Mobile App Development",
      icon: <TbAppsFilled />,
    },
    {
      id: 3,
      title: "Frontend Development",
      icon: <MdOutlineWebhook />,
    },
    {
      id: 4,
      title: "Web Development",
      icon: <FaReact />,
    },
    {
      id: 5,
      title: "Account & Finance",
      icon: <MdAccountBalance />,
    },
    {
      id: 6,
      title: "System Engineer",
      icon: <GiArtificialIntelligence />,
    },
    {
      id: 7,
      title: "Graduate Trainee",
      icon: <MdOutlineAnimation />,
    },
    {
      id: 8,
      title: "Machine Learning",
      icon: <IoGameController />,
    },
  ];

  return (
    <div className="categories">
      <h3>POPULAR CATEGORIES</h3>
      <div className="banner">
        {categories.map((element) => {
          return (
            <Link
              to={`/job/getall?category=${encodeURIComponent(element.title)}`}
              className="card"
              key={element.id}
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <div className="icon">{element.icon}</div>
              <div className="text">
                <p>{element.title}</p>
                <p>View open roles →</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;
