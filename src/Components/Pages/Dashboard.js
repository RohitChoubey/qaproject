import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt, faExclamationCircle, faWaveSquare, faPhoneSlash, faRoad, faComments, faEye, faCheckCircle, faHourglassHalf,faListAlt} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";


const iconMap = {
  1: { icon: faPhoneAlt, color: "#007bff" },
  2: { icon: faExclamationCircle, color: "#dc3545" },
  3: { icon: faPhoneSlash, color: "#dc3545" },
  4: { icon: faWaveSquare, color: "#17a2b8" },
  5: { icon: faPhoneSlash, color: "#ffc107" },
  6: { icon: faRoad, color: "#28a745" },
  7: { icon: faComments, color: "#6610f2" },
};

const Dashboard = () => {
  const [callData, setCallData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    fetch("/api/users/call-summary")
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((item) => ({
          ...item,
          ...iconMap[item.signalTypeId],
        }));

        // Calculate totals
        const total = formattedData.reduce((acc, item) => acc + (Number(item.totalCalls) || 0), 0);
        const completed = formattedData.reduce((acc, item) => acc + (Number(item.completedCalls) || 0), 0);
        const pending = formattedData.reduce((acc, item) => acc + (Number(item.pendingCalls) || 0), 0);

        setCallData(formattedData);
        setTotals({ total, completed, pending });
      })
      .catch(console.error);
  }, []);

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
                <table className="table table-responsive-lg ml-4">
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
