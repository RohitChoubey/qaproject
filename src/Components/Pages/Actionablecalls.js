import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css"; // Ensure this CSS is imported
import Swal from "sweetalert2";

export default function Actionablecalls() {
  const [tableData, setTableData] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventId, setEventId] = useState(null);
  const itemsPerPage = 10;

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
          src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${
            (index % 16) + 1
          }.mp3`,
        }));
        setTableData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedData(tableData.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, tableData]);

  const handlePlayPause = (src, id) => {
    if (currentAudio === src) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(src);
      setIsPlaying(true);
    }
    setEventId(id);
  };

  const handleExportPDF = useReactToPrint({
    content: () => document.getElementById("table-to-print"),
  });

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      pageNumbers.push(
        <li key="prev" onClick={() => setCurrentPage(currentPage - 1)}>
          &laquo;
        </li>
      );
    } else {
      pageNumbers.push(
        <li key="prev" className="disabled">
          &laquo;
        </li>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={i === currentPage ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </li>
      );
    }

    if (currentPage < totalPages) {
      pageNumbers.push(
        <li key="next" onClick={() => setCurrentPage(currentPage + 1)}>
          &raquo;
        </li>
      );
    } else {
      pageNumbers.push(
        <li key="next" className="disabled">
          &raquo;
        </li>
      );
    }

    return pageNumbers;
  };

  const handleButtonClick = (question, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: value,
    }));
  };
  const [answers, setAnswers] = useState({
    complianceSOP: null,
    activeListening: null,
    correctDetails: null,
    addressTagging: null,
    callHandlingTime: null,
    remark: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted answers:", answers);
    const formData = {
      ...answers,
      eventId: eventId,
    };

    console.log(formData);
    fetch("your-api-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: "Submitted Successfully!",
          text: `Response Submitted successfully `,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "There was an error updating the data. Please try again.",
        });
      });
  };

  return (
    <>
      <div className="main_content_iner overly_inner mt-5">
        <div className="container-fluid p-0">
          <div className="row">
            <div className="col-12">
              <div className="page_title_box d-flex align-items-center justify-content-between">
                <div className="page_title_left">
                  <h3 className="f_s_30 f_w_700 text_white">
                    Actionable Calls
                  </h3>
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

          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="white_card mb-20">
                  <table className="table table-responsive table-striped table-bordered call-logs-table ml-4">
                    <thead>
                      <tr>
                        <th scope="col">Sr. No</th>
                        <th scope="col">Event Type</th>
                        <th scope="col">Event Subtype</th>
                        <th scope="col">Call Time</th>
                        <th scope="col">Review Status</th>
                        <th scope="col">Play</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((file) => (
                        <tr key={file.id}>
                          <td>{file.id}</td>
                          <td>{file.eventType}</td>
                          <td>{file.eventSubtype}</td>
                          <td>{file.callTime}</td>
                          <td>
                            <span
                              className={
                                file.reviewStatus === "Pending"
                                  ? "text-danger font-weight-bold"
                                  : file.reviewStatus === "Completed"
                                  ? "text-success font-weight-bold"
                                  : ""
                              }
                            >
                              {file.reviewStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-circle"
                              onClick={() => handlePlayPause(file.src, file.id)}
                            >
                              <FontAwesomeIcon
                                icon={
                                  isPlaying && currentAudio === file.src
                                    ? faPause
                                    : faPlay
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul id="page-numbers" className="pagination">
                    {renderPageNumbers()}
                  </ul>
                </div>
              </div>

              <div className="col-lg-6 ">
                <div className="white_card mb-20">
                  <div className="audio-player-section p-5">
                    <AudioPlayer
                      src={currentAudio}
                      autoPlay={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <hr />
                  <div className="wrapper ml-3 white_card mb-20">
                    <div className="card-body">
                      <h3>Questionnaire</h3>
                      <div className="form-group-row">
                        <label className="col-12" htmlFor="signalInformation">
                          Signal Information
                        </label>
                        <textarea
                          className="form-control"
                          id="signalInformation"
                          rows="3"
                          value={eventId}
                          readOnly
                        ></textarea>
                      </div>
                      <div className="container">
                        <div className="row mb-3">
                          <div className="col-6">
                            <label
                              className="form-label"
                              htmlFor="complianceSOP"
                            >
                              1) Compliance of SOP
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.complianceSOP === "Poor"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("complianceSOP", "Poor")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.complianceSOP === "Good"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("complianceSOP", "Good")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.complianceSOP === "Excellent"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick(
                                    "complianceSOP",
                                    "Excellent"
                                  )
                                }
                              >
                                Excellent
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-6">
                            <label
                              className="form-label"
                              htmlFor="activeListening"
                            >
                              2) Active Listening & Proper response
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListening === "Poor"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("activeListening", "Poor")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListening === "Good"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("activeListening", "Good")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListening === "Excellent"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick(
                                    "activeListening",
                                    "Excellent"
                                  )
                                }
                              >
                                Excellent
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-6">
                            <label
                              className="form-label"
                              htmlFor="correctDetails"
                            >
                              3) Correct And Relevant Details Capturing
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.correctDetails === "Poor"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("correctDetails", "Poor")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.correctDetails === "Good"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("correctDetails", "Good")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.correctDetails === "Excellent"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick(
                                    "correctDetails",
                                    "Excellent"
                                  )
                                }
                              >
                                Excellent
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-6">
                            <label
                              className="form-label"
                              htmlFor="addressTagging"
                            >
                              4) Correct Address Tagging
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTagging === "Poor"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("addressTagging", "Poor")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTagging === "Good"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("addressTagging", "Good")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTagging === "Excellent"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick(
                                    "addressTagging",
                                    "Excellent"
                                  )
                                }
                              >
                                Excellent
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-6">
                            <label
                              className="form-label"
                              htmlFor="callHandlingTime"
                            >
                              5) Call Handled Time
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandlingTime === "Poor"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("callHandlingTime", "Poor")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandlingTime === "Good"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("callHandlingTime", "Good")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandlingTime === "Excellent"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick(
                                    "callHandlingTime",
                                    "Excellent"
                                  )
                                }
                              >
                                Excellent
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-group-row">
                        <label className="col-6" htmlFor="remark">
                          Remark (Optional)
                        </label>
                        <textarea
                          className="form-control"
                          id="remark"
                          rows="3"
                          value={answers.remark}
                          onChange={(e) =>
                            setAnswers((prevAnswers) => ({
                              ...prevAnswers,
                              remark: e.target.value,
                            }))
                          }
                        ></textarea>
                      </div>

                      <button
                        className="btn btn-primary mt-3 mb-2"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
