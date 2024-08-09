import React, { useState } from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const AdminSetting = () => {
  const [showModal, setShowModal] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [maxLimit, setMaxLimit] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableData, setTableData] = useState([
    { id: 1, callsType: "Actionable Calls", percentage: 5, maxLimit: 220 },
    { id: 2, callsType: "Abusive Calls", percentage: 5, maxLimit: 220 },
    { id: 3, callsType: "Missed Calls", percentage: 5, maxLimit: 220 },
    { id: 4, callsType: "Non-Voice Signal", percentage: 5, maxLimit: 220 },
    { id: 5, callsType: "No Response Calls", percentage: 5, maxLimit: 220 },
    { id: 6, callsType: "Trip Monitoring Calls", percentage: 5, maxLimit: 220 },
    { id: 7, callsType: "Feedback Calls", percentage: 5, maxLimit: 220 }
    // Add more rows as needed
  ]);

  const openModal = (row) => {
    setSelectedRow(row);
    setPercentage(row.percentage);
    setMaxLimit(row.maxLimit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRow(null);
    setPercentage(0);
    setMaxLimit(0);
  };

  const handleApply = async () => {
    if (selectedRow) {
      try {
        // Update the data in the database
        await axios.put(`/api/update-call/${selectedRow.id}`, {
          percentage,
          maxLimit
        });

        // Update the selected row with new values
        const updatedTableData = tableData.map((row) =>
          row.id === selectedRow.id ? { ...row, percentage, maxLimit } : row
        );

        // Update the state with the updated data
        setTableData(updatedTableData);

        Swal.fire({
          icon: "success",
          title: "Updated Successfully!",
          text: `Percentage: ${percentage}, Max Limit: ${maxLimit}`
        });

        closeModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "There was an error updating the data. Please try again."
        });
      }
    }
  };

  return (
    <div className="main_content_iner overly_inner mt-5">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="page_title_box d-flex align-items-center justify-content-between">
              <div className="page_title_left">
                <h3 className="f_s_30 f_w_700 text_white">Admin Setting</h3>
                <ol className="breadcrumb page_bradcam mb-0">
                  <li className="breadcrumb-item">
                    <Link to="#">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Admin Settings</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="white_card mb_20">
              <div className="white_card_header">
                <div className="box_header m-0">
                  <div className="main-title">
                    <h3 className="m-0">Admin Settings</h3>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped ml-5">
                  <thead>
                    <tr>
                      <th scope="col">Sr. No.</th>
                      <th scope="col">Calls Type</th>
                      <th scope="col">Percentage of Call For QA</th>
                      <th scope="col">Maximum Limit (In Number)</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.callsType}</td>
                        <td>{row.percentage}</td>
                        <td>{row.maxLimit}</td>
                        <td>
                          <button
                            className="btn btn-outline-info"
                            onClick={() => openModal(row)}
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Edit Call Details"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Edit Settings - {selectedRow.callsType}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="percentage">
                      Percentage of Calls for QA:
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="percentage"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxLimit">Maximum Limit (In Number):</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxLimit"
                      value={maxLimit}
                      onChange={(e) => setMaxLimit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSetting;
