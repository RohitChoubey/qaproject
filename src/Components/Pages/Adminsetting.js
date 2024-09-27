import React, { useState, useEffect } from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getData, postData } from "../../utils/exportUtils"; // Adjust the import path as needed

const AdminSetting = () => {
  const [showModal, setShowModal] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [maxLimit, setMaxLimit] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Fetch signal types from the API when the component mounts
  useEffect(() => {
    const fetchSignalTypes = async () => {
      try {
        const data = await getData("/signal-types");
        setTableData(data);
      } catch (error) {
        console.error("Error fetching signal types:", error);
      }
    };

    fetchSignalTypes();
  }, []);

  // Open modal and populate fields with selected row data
  const openModal = (row) => {
    setSelectedRow(row);
    setPercentage(row.percentage_of_calls_qa);
    setMaxLimit(row.maximum_limit);
    setShowModal(true);
  };

  // Close modal and reset fields
  const closeModal = () => {
    setShowModal(false);
    setSelectedRow(null);
    setPercentage(0);
    setMaxLimit(0);
  };

  // Handle applying changes (update data via API and update UI)
  const handleApply = async () => {
    if (!selectedRow || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await postData("/signal-types/", {
        signal_type_id: selectedRow.signal_type_id,
        percentage_of_calls_qa: percentage,
        maximum_limit: maxLimit,
      });

      // Update table data with new values
      setTableData((prevData) =>
        prevData.map((row) =>
          row.signal_type_id === selectedRow.signal_type_id
            ? { ...row, percentage_of_calls_qa: percentage, maximum_limit: maxLimit }
            : row
        )
      );
      Swal.fire("Updated Successfully!", `Percentage: ${percentage}, Max Limit: ${maxLimit}`, "success");
    } catch {
      Swal.fire("Update Failed", "There was an error updating the data. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
      closeModal();
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
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <tr key={row.signal_type_id}>
                          <td>{index + 1}</td>
                          <td>{row.signal_type}</td>
                          <td>{row.percentage_of_calls_qa}</td>
                          <td>{row.maximum_limit}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No records found
                        </td>
                      </tr>
                    )}
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
                  <h5 className="modal-title">Edit Settings - {selectedRow.signal_type}</h5>
                  <button type="button" className="close" onClick={closeModal} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="percentage">Percentage of Calls for QA:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="percentage"
                      value={percentage}
                      onChange={(e) => setPercentage(+e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxLimit">Maximum Limit (In Number):</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxLimit"
                      value={maxLimit}
                      onChange={(e) => setMaxLimit(+e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApply}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Apply"}
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
