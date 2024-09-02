import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faCog, faFileAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import policeImage from "../../assets/img/hr_police2.png";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const isDashboardActive = location.pathname === '/dashboard' || location.pathname.includes('/calldata');
  const isPerformanceReportActive = location.pathname === '/performancereport' || location.pathname.includes('/detailedreport');
  const isAdminSettingActive = location.pathname === '/adminsetting';

  return (
    <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="logo d-flex justify-content-between mt-5">
        <NavLink to="/" exact><img src={policeImage} alt="logo" className="h-auto" /></NavLink>
        <div className="sidebar_close_icon d-lg-none" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faTimes} />
        </div>
      </div>
      <ul id="sidebar_menu">
        <li>
          <NavLink
            to="/dashboard"
            className={isDashboardActive ? "mm-active active" : ""}
          >
            <div className="icon_menu">
              <FontAwesomeIcon icon={faTachometerAlt} size="lg" />
            </div>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/performancereport"
            className={isPerformanceReportActive ? "mm-active active" : ""}
          >
            <div className="icon_menu">
              <FontAwesomeIcon icon={faFileAlt} size="lg" />
            </div>
            <span>Performance Report</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/adminsetting"
            className={isAdminSettingActive ? "mm-active active" : ""}
          >
            <div className="icon_menu">
              <FontAwesomeIcon icon={faCog} size="lg" />
            </div>
            <span>Admin Setting</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
