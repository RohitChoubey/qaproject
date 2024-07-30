import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { faPlay, faPause, faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import "bootstrap/dist/css/bootstrap.min.css";
import Mediaplayer from "./Mediaplayer";

export default function Actionabalecalls() {
  const [tableData, setTableData] = useState([]);
  const [showPagination, setShowPagination] = useState(true);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);
  const [playingTrackIndex, setPlayingTrackIndex] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const tableRef = useRef();

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/todos/")
      .then((response) => {
        const transformedData = response.data.map((item, index) => ({
          id: index + 1,
          eventId: item.userId,
          eventType: item.title,
          eventSubtype: "Car Accident",
          callTime: "2:10 min",
          reviewStatus: item.completed ? "Completed" : "Pending",
        }));
        setTableData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleExportPDF = useReactToPrint({
    content: () => tableRef.current,
    onBeforeGetContent: () => {
      setShowPagination(false);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setShowPagination(true);
    },
  });

  const handlePlayPause = (rowIndex, eventId) => {
    if (playingTrackIndex === rowIndex) {
      setPlayingTrackIndex(null);
      setIsPlaying(false);
    } else {

      setIsPlaying(true);
      setPlayingTrackIndex(rowIndex);
      setSelectedTrackIndex(rowIndex);
      setSelectedEventId(eventId);
    }
  };

  const handlePlayerPlayPause = (isPlaying) => {
    setIsPlaying(isPlaying);
    if (!isPlaying) {
      setPlayingTrackIndex(null);
    }
  };

  const columns = [
    { dataField: "id", text: "Sr. No" },
    { dataField: "eventType", text: "Event Type" },
    { dataField: "eventSubtype", text: "Event Subtype" },
    { dataField: "callTime", text: "Call Time" },
    {
      dataField: "reviewStatus",
      text: "Review Status",
      formatter: (cell, row) => (
        <span
          style={{
            color:
              cell === "Pending"
                ? "red"
                : cell === "Completed"
                ? "green"
                : "black",
            fontWeight:
              cell === "Pending" || cell === "Completed" ? "bold" : "normal",
          }}
        >
          {cell}
        </span>
      ),
    },
    {
      dataField: "play",
      text: "Play",
      formatter: (cell, row, rowIndex) => (
        <button
          className="btn btn-primary"
          onClick={() => handlePlayPause(rowIndex, row.eventId)}
        >
          <FontAwesomeIcon
            icon={(() => {
              console.log(isPlaying);
              if (isPlaying) {
                return faPause;
              } else {
                return faPlay;
              }
            })()}
          />
        </button>
      ),
    },
  ];

  const paginationOptions = {
    sizePerPage: 10,
    hideSizePerPage: true,
    hidePageListOnlyOnePage: true,
  };

  //go back to previous page
  const goBack = () => {
    window.history.back(); // Go back to the previous page
  };

  return (
    <>
      <div className="main_content_iner overly_inner mt-5">
        <div className="container-fluid p-0">
          <div className="row">
            <div className="col-12">
              <div className="page_title_box d-flex align-items-center justify-content-between">
                <div className="page_title_left">
                  <h3 className="f_s_30 f_w_700 text_white">Actionable Calls</h3>
                  <ol className="breadcrumb page_bradcam mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Call logs</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      <Link to="#">Actionable Calls</Link>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 card_height_100">
              <div className="white_card mb_20" ref={tableRef}>
                <div className="row mb-3">
                  <div className="col-12 mt-2 text-right">
                <button className="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Back to Previous Page"  onClick={goBack}> <FontAwesomeIcon icon={faArrowLeft} /> </button> &ensp;
                    <button className="mr-3 btn"
                      style={{
                        backgroundColor: "#e91e63",
                        color: "#fff",
                        width: "20%",
                      }}
                      onClick={handleExportPDF}>
                      <FontAwesomeIcon icon={faDownload} /> PDF
                    </button>
                    <button className="mr-3 btn"
                      style={{
                        backgroundColor: "#1e88e5",
                        color: "#fff",
                        width: "20%",
                      }}
                      onClick={handleExportPDF}>
                      <FontAwesomeIcon icon={faDownload} /> Excel
                    </button>
                  </div>
                </div>
                <div className="table-responsive ml-3">
                  <BootstrapTable
                    keyField="id"
                    data={tableData}
                    columns={columns}
                    striped
                    hover
                    condensed
                    pagination={
                      showPagination
                        ? paginationFactory(paginationOptions)
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 card_height_100 ml-auto">
              <div className="white_card mb_20">
                <Mediaplayer
                  selectedTrackIndex={selectedTrackIndex}
                  eventId={selectedEventId}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayerPlayPause}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
