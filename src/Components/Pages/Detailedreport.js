import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  exportToExcel,
  exportToPDF,
  goBack,
  getData,
} from "../../utils/exportUtils";

const DetailedReport = () => {
  const { loginId } = useParams(); // Get loginId from URL parameters
  const { fromDate, toDate } = useLocation().state || {}; // Extract fromDate and toDate from location state

  // State variables
  const [tableData, setTableData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const today = new Date().toISOString().split("T")[0];
  const defaultFromDate = fromDate || today;
  const defaultToDate = toDate || today;

  // Define the columns for the table
  const columns = [
    { dataField: "id", text: "Sr. No." }, // Serial number column
    { dataField: "sco_employee_code", text: "SCO Employee Code" }, // SCO Employee Code column
    { dataField: "co_name", text: "CO Name" }, // CO Name column
    { dataField: "co_employee_code", text: "CO Employee Code" }, // CO Employee Code column
    {
      dataField: "sco_qa_time",
      text: "SCO QA Time",
      formatter: (cell) => {
        // Convert sco_qa_time (in seconds) to min:second format
        const minutes = Math.floor(cell / 60);
        const seconds = cell % 60;
        return `${minutes}:${seconds < 10 ? "00" : ""}${seconds}`;
      },
    }, // SCO QA Time column with custom formatter
    { dataField: "sop_score", text: "SOP Score" }, // SOP Score column
    { dataField: "active_listening_score", text: "Active Listening" }, // Active Listening Score column
    { dataField: "relevent_detail_score", text: "Relevant Detail" }, // Relevant Detail Score column
    { dataField: "address_tagging_score", text: "Address Tagging" }, // Address Tagging Score column
    { dataField: "call_handled_time_score", text: "Call Handled Time" }, // Call Handled Time Score column
    { dataField: "sco_remarks", text: "Remarks" }, // Remarks column
  ];

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchData(currentPage, loginId, defaultFromDate, defaultToDate);
  }, [loginId, defaultFromDate, defaultToDate, currentPage]);

  // Function to fetch data from the API
  const fetchData = async (page, loginId, fromDate, toDate, itemsPerPage) => {
    // Construct the API URL with query parameters
    const dataUrl = `/sco-detailed-data?scoEmployeeCode=${loginId}&startDate=${fromDate}&endDate=${toDate}`;
  
    try {
      // Fetch data from the API using the getData function
      const data = await getData(dataUrl);
  
      // Transform the data to include Sr. No. and other necessary modifications
      const transformedData = data.map((item, index) => ({
        ...item,
        id: index + 1 + (page - 1) * itemsPerPage, // Generate Sr. No. based on page and index
        sco_qa_time: item.sco_qa_time, // Ensure sco_qa_time is available for formatter
      }));
  
      // Set the paginated data for the current page
      setTableData(
        transformedData.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      );
  
      // Set the total number of items for pagination
      setTotalItems(transformedData.length);
    } catch (error) {
      // The error handling is already managed by getData, 
      // so you may not need additional error handling here
      console.error("Error fetching data:", error); // Optional: log error for debugging
    }
  };
  
  // Handle export (PDF/Excel)
  const handleExport = async (type) => {
    const dataUrl = `/sco-detailed-data?scoEmployeeCode=${loginId}&startDate=${encodeURIComponent(
      defaultFromDate
    )}&endDate=${encodeURIComponent(defaultToDate)}`;
    try {
      setLoading(true);
      if (type === "pdf") {
        await exportToPDF(dataUrl, columns, "Detailed_report.pdf");
      } else {
        await exportToExcel(dataUrl, columns, "Detailed_report.xlsx");
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="main_content_iner overly_inner mt-5">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="page_title_box d-flex align-items-center justify-content-between">
              <div className="page_title_left">
                <h3 className="f_s_30 f_w_700 text_white">SCO Detail Report</h3>
                <ol className="breadcrumb page_bradcam mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/dashboard">Performance Report</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <Link to="#">SCO Performance Report</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    <Link to="#">SCO Detailed Report</Link>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 card_height_100">
            <div className="white_card mb_20">
              <div className="row mb-3 justify-content-end mr-5">
                <div className="col-lg-6 col-md-6 col-sm-6 mt-4 ml-5 mt-5">
                  <h3>
                    <b>
                      SCO-{loginId} Details Report from{" "}
                      {formatDate(defaultFromDate)} -{" "}
                      {formatDate(defaultToDate)}
                    </b>
                  </h3>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 mt-4 ml-auto">
                  <button
                    className="btn btn-primary mt-3"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Back to Previous Page"
                    onClick={goBack}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>{" "}
                  &ensp;
                  <button
                    className="btn mt-3"
                    style={{
                      backgroundColor: "#e91e63",
                      color: "#fff",
                      width: "30%",
                    }}
                    onClick={() => handleExport("pdf")}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDownload} /> PDF
                      </>
                    )}
                  </button>{" "}
                  &ensp;
                  <button
                    className="btn mt-3"
                    style={{
                      backgroundColor: "#1e88e5",
                      color: "#fff",
                      width: "30%",
                    }}
                    onClick={() => handleExport("excel")}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDownload} /> Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="table-responsive ml-5">
                <BootstrapTable
                  keyField="id"
                  data={tableData}
                  columns={columns}
                  striped
                  hover
                  condensed
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <ul
              id="page-numbers"
              className="justify-content-end pagination mr-5"
            >
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
              >
                <span>&laquo;</span>
              </li>
              {Array.from({ length: totalPages }, (_, index) => {
                const startPage = currentPage <= 3 ? 0 : currentPage - 3;
                const endPage =
                  startPage + 5 >= totalPages ? totalPages : startPage + 5;
                return index >= startPage && index < endPage ? (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      index + 1 === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    <span>{index + 1}</span>
                  </li>
                ) : null;
              })}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
              >
                <span>&raquo;</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;
