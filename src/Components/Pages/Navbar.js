import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/style1.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import policeImage from "../../assets/img/QA_hr_logo.png";
import userLogo from "../../assets/img/hr_police2.png";

const Navbar = ({ toggleSidebar, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear localStorage and update authentication state
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="container-fluid g-0 headernew">
      <div className="row">
        <div className="col-lg-12 p-0">
          <div className="header_iner d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="sidebar_icon d-lg-none" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faBars} />
              </div>
              <img
                src={policeImage}
                alt="Police Image"
                className=" ms-4"
                style={{ maxWidth: "299px" }}
              />
            </div>
            <label class="d-none d-md-inline-block ml-auto">
            <span class="text-name">CDAC  [Admin-State Login]</span>
            </label>
            <div className="header_right justify-content-between align-items-center">
              <div className="profile_info">
                {/* <FontAwesomeIcon icon={faCircleUser} size="2x" /> */}
                <img src={userLogo} alt="Police Image" className=" ms-4" />
                <div className="profile_info_iner">
                  <div className="profile_author_name">
                    <h5>CDAC [Admin-State Login]
                    </h5>
                    {/* <h5>Er. Rohit</h5> */}
                  </div>
                  <div className="profile_info_details">
                    <Link to="" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
