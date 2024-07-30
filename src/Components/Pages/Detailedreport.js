import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { exportToExcel, exportToPDF, goBack } from "../../utils/exportUtils"; // Import the functions

const DetailedReport = () => {
  const { loginId } = useParams();
  const location = useLocation();
  const { fromDate, toDate } = location.state || {};
  const [tableData, setTableData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const today = new Date();
  const defaultFromDate = fromDate || today;
  const defaultToDate = toDate || today;
  const columns = [
    { dataField: "id", text: "Sr. No." },
    { dataField: "eventType", text: "Event Type" },
    { dataField: "eventSubtype", text: "Event Subtype" },
    { dataField: "callDuration", text: "Call Duration" },
    { dataField: "reviewStatus", text: "Review Status" },
    { dataField: "callType", text: "Call Type" },
    { dataField: "complianceScore", text: "Compliance of SOP QA Score" },
    {
      dataField: "activeListeningScore",
      text: "Active Listening & proper response QA Score",
    },
    {
      dataField: "detailsCapturingScore",
      text: "Correct and relevant details capturing QA Score",
    },
    {
      dataField: "addressTaggingScore",
      text: "Correct Address tagging QA Score",
    },
    { dataField: "callHandledTime", text: "Call Handled Time QA time" },
  ];

  useEffect(() => {
    fetchData(currentPage, loginId, defaultFromDate, defaultToDate);
  }, [loginId, defaultFromDate, defaultToDate, currentPage]);

  const apiUrl = `https://jsonplaceholder.typicode.com/todos`;

  const transformData = (data, page) => {
    return data.map((item, index) => ({
      ...item,
      id: index + 1 + (page - 1) * itemsPerPage,
      eventType: item.title,
      eventSubtype: "Subtype" + index,
      callDuration: "00:0" + index,
      reviewStatus: item.completed,
      callType: "Type",
      complianceScore: item.id,
      activeListeningScore: 85 + index,
      detailsCapturingScore: 90 + index,
      addressTaggingScore: 95 + index,
      callHandledTime: "00:1" + index,
    }));
  };

  const fetchData = async (page, loginId, defaultFromDate, defaultToDate) => {
    try {
      const response = await fetch(
        `${apiUrl}?userId=${loginId}&fromDate=${encodeURIComponent(
          defaultFromDate
        )}&toDate=${encodeURIComponent(defaultToDate)}`
      );
      const data = await response.json();
      const transformedData = transformData(data, page);
      const slicedData = transformedData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );
      setTableData(slicedData);
      setTotalItems(transformedData.length); // Set the total count based on all items fetched
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleExport = async (type) => {
    const dataUrl = `${apiUrl}?userId=${loginId}&fromDate=${encodeURIComponent(
      defaultFromDate
    )}&toDate=${encodeURIComponent(defaultToDate)}`;
    console.log(dataUrl);
    try {
      setLoading(true);
      console.log("Export data URL:", dataUrl);
      console.log("Columns for export:", columns);
      if (type === "pdf") {
        await exportToPDF(dataUrl, columns, "Detailed_report.pdf");
      } else if (type === "excel") {
        await exportToExcel(dataUrl, columns, "Detailed_report.xlsx");
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return dateObj.toLocaleDateString("en-GB", options);
  };

  return (
    <div className="main_content_iner overly_inner mt-5">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="page_title_box d-flex align-items-center justify-content-between">
              <div className="page_title_left">
                <h3 className="f_s_30 f_w_700 text_white">
                  SCO Detail Report
                </h3>
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
                    {" "}
                    <FontAwesomeIcon icon={faArrowLeft} />{" "}
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
        <ul id="page-numbers" className="justify-content-end pagination mr-5">
          {/* Previous Button */}
          <li
            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
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
            const endPage = startPage + 5 >= totalPages ? totalPages : startPage + 5;

            if (index >= startPage && index < endPage) {
              return (
                <li
                  key={index + 1}
                  className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}
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
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => {
              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
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
