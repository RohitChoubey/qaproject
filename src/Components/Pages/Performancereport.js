import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  faDownload,
  faSearch,
  faSortDown,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  exportToExcel,
  exportToPDF,
  fetchPerformanceData,
} from "../../utils/exportUtils";

export default function PerformanceReport() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [reportType, setReportType] = useState("CO Performance");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const tableRef = useRef();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showTable, setShowTable] = useState(false); // Control table visibility
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [filteredData, setFilteredData] = useState(tableData);

  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);
  const handleShiftChange = (e) => setSelectedShift(e.target.value);

  // Define columns for "SCO Performance"
  const columnsCO = [
    { dataField: "srNo", text: "Sr. No" },
    { dataField: "co_employee_code", text: "Employee Code" },
    { dataField: "co_name", text: "CO Name" },
    { dataField: "total_calls", text: "Total Calls" },
    // { dataField: "total_completed_calls", text: "Total Completed Calls" },
    {
      dataField: "average_call_duration_millis",
      text: "Average Call Duration (MM:SS)",
    }, // Updated text
    { dataField: "sop_score", text: "Compliance of SOP QA" },
    {
      dataField: "active_listening_score",
      text: "Active Listening & Proper Response QA",
    },
    {
      dataField: "relevent_detail_score",
      text: "Correct and Relevant Details Capturing QA",
    },
    { dataField: "address_tagging_score", text: "Correct Address Tagging QA" },
    { dataField: "call_handled_time_score", text: "Call Handled Time" },
    // { dataField: "call_duration_millis", text: "Call Duration (MM:SS)" },
    { dataField: "average_score", text: "Average Score" },
  ];

  // Define columns for "SCO Performance"
  const columnsSCO = [
    { dataField: "srNo", text: "Sr. No", sort: true },
    { dataField: "sco_employee_code", text: "Login ID", sort: true },
    {
      dataField: "total_calls",
      text: "Completed QA",
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    },
    {
      dataField: "average_qa_time",
      text: "Average QA Completion Time",
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    },
    {
      dataField: "pending_calls",
      text: "Average Pending QA per Day",
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: "flex" }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    },
    {
      dataField: "detailReport",
      text: "Actions",
      formatter: (cell, row) => (
        <button
          className="btn btn-outline-info"
          data-toggle="tooltip"
          data-placement="top"
          title="Edit Call Details"
          onClick={() =>
            handleDetailClick(row.sco_employee_code, fromDate, toDate)
          }
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      ),
    },
  ];

  // State for dynamic columns
  const [columns, setColumns] = useState(columnsCO);

  // Ref to track initial load
  const isInitialLoad = useRef(true);

  const fetchData = async (page) => {
    setLoading(true);
    setNoDataMessage("");
    try {
      const data = await fetchPerformanceData(
        page,
        reportType,
        fromDate,
        toDate,
        selectedShift,
        itemsPerPage
      );
      if (data.length === 0) {
        setNoDataMessage(
          "No record found on the selected dates. Please change the From Date and To Date."
        );
        setTableData([]);
        setShowTable(false);
      } else {
        setTableData(data);
        setTotalItems(data.length);
        setShowTable(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setNoDataMessage("An error occurred while fetching data.");
      setShowTable(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    setShowTable(reportType !== "SCO Performance");

    if (isInitialLoad.current) {
      const today = new Date();
      const lastMonthDate = new Date(today.setMonth(today.getMonth() - 1));
      const startDate = fromDate || lastMonthDate.toISOString().split("T")[0];
      setFromDate(startDate);
      fetchData(currentPage, reportType, startDate, toDate, selectedShift);
      isInitialLoad.current = false; // Mark as loaded after fetching
    }
  }, [reportType]); // Only run this effect on initial load or report type change

  const handleDetailClick = (loginId, fromDate, toDate) => {
    navigate(`/detailedreport/${loginId}`, { state: { fromDate, toDate } });
  };

  // Handle export for both PDF and Excel
  const handleExport = async (type) => {
    const apiUrl = `/co-qa-data?reportType=${
      reportType === "SCO Performance" ? "SCO" : "CO"
    }&startDate=${fromDate}&endDate=${toDate}${
      selectedShift ? `&shift=${selectedShift}` : ""
    }`;
    try {
      setLoading(true);
      if (type === "pdf") {
        await exportToPDF(apiUrl, columns);
      } else if (type === "excel") {
        await exportToExcel(apiUrl, columns);
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (event) => {
    const newValue = event.target.value;
    setReportType(newValue);
    setShowTable(false); // Hide the table when changing report type
  };

  const handleSearch = () => {
    setColumns(reportType === "CO Performance" ? columnsCO : columnsSCO);
    setShowTable(false); // Reset table visibility
    setCurrentPage(1);
    fetchData(1, reportType, fromDate, toDate, selectedShift); // Call fetchData with current parameters
  };

  // Modify handleSearch to include the search query
  // const handleSearchQuery = () => {
  //   setCurrentPage(1); // Reset to first page
  //   fetchData(1, reportType, fromDate, toDate, selectedShift, searchQuery);
  // };

  // Filtering data based on search query

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // If searchQuery is empty, show full tableData
      setFilteredData(tableData);
    } else {
      // Filter data
      const filtered = tableData.filter((item) =>
        Object.values(item).some((value) =>
          value
            ? value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            : false
        )
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, tableData]);

  return (
    <div>
      <div className="main_content_iner overly_inner mt-5">
        <div className="container-fluid p-0">
          <div className="row">
            <div className="col-12">
              <div className="page_title_box d-flex align-items-center justify-content-between">
                <div className="page_title_left">
                  <h3 className="f_s_30 f_w_700 text_white">
                    Performance Report
                  </h3>
                  <ol className="breadcrumb page_bradcam mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      <Link to="#">Performance Report</Link>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div
            className="ml-lg-auto p-lg-5 w-25"
            style={{ marginBottom: "-118px" }}
          >
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="row mb-3 mt-5 align-items-center">
            <div className="col-lg-2 col-md-6 col-sm-6">
              <Form.Group controlId="reportTypeSelect">
                <Form.Label>Select Report Type</Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleReportTypeChange}
                  value={reportType}
                >
                  <option value="CO Performance">CO Performance</option>
                  <option value="SCO Performance">SCO Performance</option>
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6">
              <Form.Group controlId="fromDateSelect">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  onChange={handleFromDateChange}
                  value={fromDate}
                />
              </Form.Group>
            </div>

            <div className="col-lg-2 col-md-6 col-sm-6">
              <Form.Group controlId="toDateSelect">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  onChange={handleToDateChange}
                  value={toDate}
                />
              </Form.Group>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-6">
              <Form.Group controlId="shoftSelect">
                <Form.Label>Select Shift</Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleShiftChange}
                  value={selectedShift}
                >
                  <option value="">-- Select Shift --</option>
                  <option value="all" active>
                    All
                  </option>
                  <option value="morning">Morning</option>
                  <option value="afternon">Afternon/Evening</option>
                  <option value="night">Night</option>
                  {/* Add more months as needed */}
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col-lg-1 col-md-6 col-sm-6">
              <Button
                variant="primary mt-4"
                data-toggle="tooltip"
                data-placement="top"
                title="Search"
                onClick={handleSearch}
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6 mt-4">
              <button
                className="btn"
                style={{
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  width: "40%",
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
                className="btn"
                style={{
                  backgroundColor: "#1e88e5",
                  color: "#fff",
                  width: "40%",
                }}
                variant="success"
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

          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 card_height_100">
              <div className="white_card mb_20" ref={tableRef}>
                <div className="table-responsive ml-5">
                  <div className="mt-4">
                    {noDataMessage ? (
                      <div className="alert alert-info mt-4 mr-5">
                        {noDataMessage}
                      </div>
                    ) : (
                      <BootstrapTable
                        keyField="srNo"
                        data={tableData}
                        columns={columns}
                        noDataIndication={() =>
                          loading ? "Loading..." : "No records found"
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Component */}
          <div className="row">
            <div className="col-12">
              <ul
                id="page-numbers"
                className="justify-content-end pagination mr-5"
              >
                {/* Previous Button */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => {
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                >
                  <span>&laquo;</span>
                </li>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                  // Calculate range to display only 5 pages at a time
                  const startPage = currentPage <= 3 ? 0 : currentPage - 3;
                  const endPage =
                    startPage + 5 >= totalPages ? totalPages : startPage + 5;

                  if (index >= startPage && index < endPage) {
                    return (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          index + 1 === currentPage ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        <span>{index + 1}</span>
                      </li>
                    );
                  }
                  return null;
                })}

                {/* Next Button */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                >
                  <span>&raquo;</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
