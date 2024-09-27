import { Link, useNavigate  } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  faDownload,
  faSearch,
  faInfoCircle,
 faSortDown
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import "bootstrap/dist/css/bootstrap.min.css";
import { exportToExcel, exportToPDF, useFetchData } from "../../utils/exportUtils";


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

  const columnsCO = [
    { dataField: "id", text: "Sr. No" },
    { dataField: "name", text: "Name" },
    { dataField: "averageCallPerDay", text: "Total Calls" },
    { dataField: "totalCompletedCalls", text: "Total Completed Calls" },
    { dataField: "averageCallDuration", text: "Average Call Duration" },
    { dataField: "complianceSopQAScore", text: "Compliance of SOP QA Score" },
    {
      dataField: "activeListeningProperResponse",
      text: "Active Listening & Proper Response QA Score",
    },
    {
      dataField: "correctRelevantDetails",
      text: "Correct and Relevant Details Capturing QA Score",
    },
    {
      dataField: "correctAddressTagging",
      text: "Correct Address Tagging QA Score",
    },
    {
      dataField: "callHandeledTime",
      text: "Call Handled Time QA Time Average QA Score",
    },
    { dataField: "averageQAScoreFeedback", text: "QA Score Feedback Calls" },
  ];

  // Define columns for "SCO Performance"
  const columnsSCO = [
    { dataField: 'id', text: 'Sr. No', sort: true },
    { dataField: 'nameSEO', text: 'Name', sort: true },
    { dataField: 'loginId', text: 'Login ID', sort: true },
    { dataField: 'qaCalls', text: 'QA Calls', sort: true },
    { 
      dataField: 'completedQa', 
      text: 'Completed QA',
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    
    },
    {
      dataField: 'averageQaCompletionTime',
      text: 'Average QA Completion Time',
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    },
    {
      dataField: 'averagePendingQaPerDay',
      text: 'Average Pending QA per Day',
      sort: true,
      headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
        <div style={{ display: 'flex' }}>
          {column.text}
          {sortElement}
          &ensp;
          {<FontAwesomeIcon icon={faSortDown} />}
        </div>
      ),
    },
    { dataField: 'detailReport', text: 'Detail Report' },
  ];

  // State for dynamic columns

  const [columns, setColumns] = useState(columnsCO);
  const fetchData = async (page) => {
    const apiUrl = `https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=${itemsPerPage}${
      reportType === "SCO Performance" ? "&reportType=SCO" : ""
    }${fromDate ? `&fromDate=${fromDate}` : ""}${toDate ? `&toDate=${toDate}` : ""}${
      selectedShift ? `&selectedShift=${selectedShift}` : ""
    }`;
    
    try {
      const response = await axios.get(apiUrl);
      const transformedData = response.data.map((item, index) => ({
        ...item,
        id: index + 1 + (page - 1) * itemsPerPage,
        name: "CO Name",
        //name: reportType === 'SCO Performance' ? 'rohit' : item.name,
        nameSEO: "SEO Name" + index, // Assuming name is a field in your API response
      
        loginId: "john_doe123",
        qaCalls: 20,
        completedQa: 15,
        averageQaCompletionTime: index+2,
        averagePendingQaPerDay: index+5,
        

        detailReport: (
          // <button onClick={() => handleDetailClick(item.loginId)}>
          <button
            className="info-button"
            data-toggle="tooltip"
            data-placement="top"
            title="Click here for more info"
            onClick={() => handleDetailClick(1, fromDate, toDate)}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="fa-info-circle" />
          </button>
        ),

        // Add other fields from response as needed
      }));

      setTableData(transformedData);
      setTotalItems(parseInt(response.headers["x-total-count"], 10));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDetailClick = (loginId, fromDate, toDate) => {
    navigate(`/detailedreport/${loginId}`, { state: { fromDate, toDate } });
  };

  useEffect(() => {
    fetchData(currentPage, reportType, fromDate, toDate);
  }, [currentPage, reportType,  fromDate, toDate]);

  // Handle export to PDF
  const handleExportPDF = async () => {
    setLoading(true);
    const dataUrl = `https://jsonplaceholder.typicode.com/todos?${
      reportType === "SCO Performance" ? "&reportType=SCO" : ""
    }${fromDate ? `&fromDate=${fromDate}` : ""}${toDate ? `&toDate=${toDate}` : ""}${
      selectedShift ? `&selectedShift=${selectedShift}` : ""
    }`;

    try {
      await exportToPDF(dataUrl, columns);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }

    setLoading(false);
  };

   // Handle export to Excel
   const handleExportExcel = async () => {
    setLoading(true);
    const dataUrl = `https://jsonplaceholder.typicode.com/todos?${
      reportType === "SCO Performance" ? "&reportType=SCO" : ""
    }${fromDate ? `&fromDate=${fromDate}` : ""}${toDate ? `&toDate=${toDate}` : ""}${
      selectedShift ? `&selectedShift=${selectedShift}` : ""
    }`;

    try {
      await exportToExcel(dataUrl);
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }

    setLoading(false);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
    setCurrentPage(1); // Reset to first page on report type change
  };

  const handleFromDateChange = (event) => {
    setFromDate(event.target.value);
    setCurrentPage(1); // Reset to first page on month change
  };

  const handleToDateChange = (event) => {
    setToDate(event.target.value);
    setCurrentPage(1); // Reset to first page on month change
  };

  const handleShiftChange = (event) => {
    setSelectedShift(event.target.value);
    setCurrentPage(1); // Reset to first page on month change
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);

    // Update columns based on report type
    if (reportType === "CO Performance") {
      setColumns(columnsCO);
    } else if (reportType === "SCO Performance") {
      setColumns(columnsSCO);
    }
  };

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

          <div className="row mb-3">
            {/* <div className="col-12">
              <Button variant="success" onClick={handleExportPDF} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} /> Export PDF
                  </>
                )}
              </Button>
              <Button variant="success" onClick={handleExportExcel} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} /> Export Excel
                  </>
                )}
              </Button>
            </div> */}
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
                onClick={handleExportPDF}
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
                onClick={handleExportExcel}
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
                <div className="table-responsive ml-4">
                <div className="ml-3 mt-4">
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
          </div>

          <div className="row">
          <div className="col-12">
            <ul className="justify-content-end pagination mr-5">
              {/* Previous Button */}
              {currentPage > 1 && (
                <li
                  className="page-item"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <span className="page-link">Previous</span>
                </li>
              )}

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
                      <span className="page-link">{index + 1}</span>
                    </li>
                  );
                }
                return null;
              })}

              {/* Next Button */}
              {currentPage < totalPages && (
                <li
                  className="page-item"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <span className="page-link">Next</span>
                </li>
              )}
            </ul>
          </div>
        </div>
          </div>
        </div>
      </div>
    
  );
}
// Define columns for "CO Performance"
const columnsCO = [
  { dataField: "srNo", text: "Sr. No", sort: true },
  { dataField: "co_employee_code", text: "Employee Code", sort: true },
  { dataField: "co_name", text: "CO Name", sort: true },  
  { dataField: "total_calls", text: "Total Calls", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
   },
  { dataField: "average_call_duration_millis", text: "Average Call", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
  },
  { dataField: "sop_score", text: "Compliance of SOP", sort: true },
  { dataField: "active_listening_score", text: "Active Listening & Proper Response", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
   },
  { dataField: "relevent_detail_score", text: "Correct and Relevant Details Capturing", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
   },
  { dataField: "address_tagging_score", text: "Correct Address Tagging", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
   },
  { dataField: "call_handled_time_score", text: "Call Handled Time", sort: true,
    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
   },
  { dataField: "average_score", text: "Average Score", sort: true,

    headerFormatter: (column, colIndex, { sortElement, sortOrder }) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {column.text}
        {sortElement}
        &ensp;
        {<FontAwesomeIcon icon={faSortDown} />}
      </div>
    ),
  },
];

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
