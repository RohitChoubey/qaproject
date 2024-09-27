import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPhoneAlt, faExclamationCircle, faWaveSquare, faPhoneSlash, faRoad, faComments, faEye, faCheckCircle, faHourglassHalf, faListAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";
import { fetchData } from "../../utils/exportUtils";

// Map of signal types to their corresponding icons and colors
const iconMap = {
  1: { icon: faPhoneAlt, color: "#007bff" }, // Phone icon, blue color
  2: { icon: faExclamationCircle, color: "#dc3545" }, // Exclamation icon, red color
  3: { icon: faPhoneSlash, color: "#dc3545" }, // Phone slash icon, red color
  4: { icon: faWaveSquare, color: "#17a2b8" }, // Wave square icon, teal color
  5: { icon: faPhoneSlash, color: "#ffc107" }, // Phone slash icon, yellow color
  6: { icon: faRoad, color: "#28a745" }, // Road icon, green color
  7: { icon: faComments, color: "#6610f2" }, // Comments icon, purple color
};

// Dashboard component to display call summary
const Dashboard = () => {
  const [callData, setCallData] = useState([]); // State to hold the call data
  const [totals, setTotals] = useState({ total: 0, completed: 0, pending: 0 }); // State to hold totals for calls

  useEffect(() => {
    // Function to fetch call summary data
    const fetchCallSummary = async () => {
      try {
        // Fetch data from the API endpoint
        const data = await fetchData("/call-summary");
        
        // Format the fetched data to include icons and colors based on signal type
        const formattedData = data.map((item) => ({
          ...item,
          ...iconMap[item.signalTypeId], // Add icon and color from iconMap
        }));

        // Calculate total calls from formatted data
        const total = formattedData.reduce(
          (acc, item) => acc + (Number(item.totalCalls) || 0), // Sum totalCalls, default to 0 if NaN
          0
        );

        // Calculate completed calls
        const completed = formattedData.reduce(
          (acc, item) => acc + (Number(item.completedCalls) || 0), // Sum completedCalls, default to 0 if NaN
          0
        );

        // Calculate pending calls
        const pending = formattedData.reduce(
          (acc, item) => acc + (Number(item.pendingCalls) || 0), // Sum pendingCalls, default to 0 if NaN
          0
        );

        // Update state with formatted call data and totals
        setCallData(formattedData);
        setTotals({ total, completed, pending });
      } catch (error) {
        console.error("Error in fetching call summary:", error); // Log error if fetching fails
      }
    };

    fetchCallSummary(); // Call the function to fetch call summary data
  }, [fetchData, iconMap]); // Dependencies for useEffect; include fetchData and iconMap


  return (
    <div className="main_content_iner overly_inner mt-5">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="page_title_box d-flex align-items-center justify-content-between">
              <div className="page_title_left">
                <h3 className="f_s_30 f_w_700 text_white">Dashboard</h3>
                <ol className="breadcrumb page_bradcam mb-0">
                  <li className="breadcrumb-item">
                    <Link to="#">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Call Logs</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="main-content">
            <div className="overview-section">
              <div className="overview-card">
                <h2>
                  <FontAwesomeIcon
                    icon={faListAlt}
                    style={{ color: "blue", marginRight: "10px" }}
                  />
                  <strong>Total Calls</strong>
                </h2>
                <div className="overview-number">{totals.total}</div>
              </div>
              <div className="overview-card">
                <h2>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ color: "rgb(40, 167, 69)", marginRight: "10px" }}
                  />
                  <strong>Completed Calls</strong>
                </h2>
                <div className="overview-number">{totals.completed}</div>
              </div>
              <div className="overview-card">
                <h2>
                  <FontAwesomeIcon
                    icon={faHourglassHalf}
                    style={{ color: "orange", marginRight: "10px" }}
                  />
                  <strong>Pending Calls</strong>
                </h2>
                <div className="overview-number">{totals.pending}</div>
              </div>
            </div>
          </div>
          {callData.map((call, index) => (
            <div key={index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
              <div className="white_card mb_20">
                <div className="white_card_header">
                  <div className="box_header m-0">
                    <div className="main-title">
                      <h3 className="m-0">
                        <FontAwesomeIcon icon={call.icon} color={call.color} />{" "}
                        {call.signalType}
                      </h3>
                    </div>
                  </div>
                </div>
                <table className="table ml-4">
                  <thead>
                    <tr>
                      <th>Total Calls</th>
                      <th>Calls For QA</th>
                      <th>Pending</th>
                      <th>Call List</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{call.totalCalls}</td>
                      <td>{call.completedCalls}</td>
                      <td>{call.pendingCalls}</td>
                      <td>
                        <NavLink
                          to={`/calldata?signal_type=${
                            call.signalTypeId
                          }&type=${encodeURIComponent(call.signalType)}`}
                          data-toggle="tooltip"
                          title="View Call Details"
                        >
                          <button className="btn btn-default">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </NavLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
