import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faExclamationCircle,
  faWaveSquare,
  faPhoneSlash,
  faRoad,
  faComments,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";

const callData = [
  { type: "Actionable Calls", total: 4500, qa: 225, pending: 220, icon: faPhoneAlt, color: "#007bff", path: "/actionablecalls" },
  { type: "Abusive Calls", total: 4500, qa: 225, pending: 220, icon: faExclamationCircle, color: "#dc3545", path: "/abusivecalls" },
  { type: "Missed Calls", total: 4500, qa: 225, pending: 220, icon: faPhoneSlash, color: "#dc3545", path: "/missedcalls" },
  { type: "Non Voice Signal", total: 4500, qa: 225, pending: 220, icon: faWaveSquare, color: "#17a2b8", path: "/nonvoicesignal" },
  { type: "No Response Calls", total: 4500, qa: 225, pending: 220, icon: faPhoneSlash, color: "#ffc107", path: "/noresponsecalls" },
  { type: "Trip Monitoring Calls", total: 4500, qa: 225, pending: 220, icon: faRoad, color: "#28a745", path: "/tripmonitoringcalls" },
  { type: "Feedback Calls", total: 4500, qa: 225, pending: 220, icon: faComments, color: "#6610f2", path: "/feedbackcalls" },
];

const Dashboard = () => {
  
  return (
    <>
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
            {callData.map((call, index) => (
              <div key={index} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                <div className="white_card mb_20">
                  <div className="white_card_header">
                    <div className="box_header m-0">
                      <div className="main-title">
                        <h3 className="m-0">
                          <FontAwesomeIcon icon={call.icon} color={call.color} /> {call.type}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <table className="table table-responsive-lg ml-4">
                    <thead>
                      <tr>
                        <th scope="col">Total Calls</th>
                        <th scope="col">Calls For QA</th>
                        <th scope="col">Pending</th>
                        <th scope="col">Call List</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{call.total}</td>
                        <td>{call.qa}</td>
                        <td>{call.pending}</td>
                        <td>
                          <NavLink
                            to={call.path}
                            data-toggle="tooltip"
                            data-placement="top"
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
    </>
  );
};

export default Dashboard;
