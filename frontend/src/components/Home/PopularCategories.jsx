import React from "react";
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

const PopularCategories = () => {
  const categories = [
    {
      id: 2,
      title: "Mobile App Developer",
      subTitle: "175+ Openings",
      icon: <TbAppsFilled />,
    },
    {
      id: 1,
      title: "Data Analyst",
      subTitle: "200+ Openings",
      icon: <MdOutlineDesignServices />,
    },
    {
      id: 3,
      title: "Frontend Developer",
      subTitle: "250+ Openings",
      icon: <MdOutlineWebhook />,
    },
    {
      id: 4,
      title: "Web Developer",
      subTitle: "180+ Openings",
      icon: <FaReact />,
    },
    {
      id: 5,
      title: "Business Analyst",
      subTitle: "95+ Openings",
      icon: <MdAccountBalance />,
    },
    {
      id: 6,
      title: "System Engineer",
      subTitle: "120+ Openings",
      icon: <GiArtificialIntelligence />,
    },
    {
      id: 7,
      title: "Graduate Trainee",
      subTitle: "300+ Openings",
      icon: <MdOutlineAnimation />,
    },
    {
      id: 8,
      title: "Machine Learning Engineer",
      subTitle: "85+ Openings",
      icon: <IoGameController />,
    },
  ];  return (
    <div className="categories">
      <h3>POPULAR CATEGORIES</h3>
      <div className="banner">
        {categories.map((element) => {
          return (
            <div className="card" key={element.id}>
              <div className="icon">{element.icon}</div>
              <div className="text">
                <p>{element.title}</p>
                <p>{element.subTitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;