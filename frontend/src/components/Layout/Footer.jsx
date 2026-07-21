import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

const Footer = () => {
  const { isAuthorized } = useContext(Context);
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
          Our mission is to streamline the placement process, providing a seamless and efficient platform for students, recruiters, and college administrators to achieve their goals effortlessly.
          </p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Home
              </a>
            </li>
            <li>
              <Link to="https://jgigroup.in/btech2026/?utm_source=Google+&utm_medium=Google+Paid+&utm_campaign=Google+BTech+Application+&utm_term=Google+Paid+&gad_source=1&gad_campaignid=23336348824&gbraid=0AAAAADD5sBqS1A1qw--kW7PIVU8y9HXmX&gclid=CjwKCAjwsfzSBhB5EiwAOGyqSdEvhZVibUxxi43yLsEc2JlcU75AITb9De80f_ds1eM8fl62AIXvXRoCql0QAvD_BwE">
                About
              </Link>
            </li>
            <li>
              <Link to="https://www.jainuniversity.ac.in/">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/JAINDeemedtobeUniversityofficial/">
              <FaFacebookF />
            </a>
            <a href="https://www.instagram.com/jainuniversityofficial/">
              <RiInstagramFill />
            </a>
            <a href="https://www.youtube.com/channel/UCmKs5HVxglWe5s8vYw2BbQQ">
              <FaYoutube />
            </a>
            <a href="https://www.linkedin.com/school/jaindeemedtobeuniversity/">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;