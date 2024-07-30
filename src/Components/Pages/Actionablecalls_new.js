import React, { useState, useEffect } from "react";
import "../../assets/css/CallLogsComponent.css";
import { FaPlay, FaPause } from "react-icons/fa";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "../../assets/css/mediaplayer.css"; // Ensure you have the required styles
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";

const sampleAudioFiles = Array.from({ length: 80 }, (_, index) => ({
  id: index + 1,
  username: `User${index + 1}`,
  eventType: "Content",
  eventSubtype: "Content",
  callDuration: "5:00",
  reviewStatus: "Pending",
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${
    (index % 16) + 1
  }.mp3`,
}));

const itemsPerPage = 13;

const Actionablecalls = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAudio, setCurrentAudio] = useState(sampleAudioFiles[0].src);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedData(sampleAudioFiles.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage]);

  const handlePlayPause = (src) => {
    if (currentAudio === src) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(src);
      setIsPlaying(true);
    }
  };

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(sampleAudioFiles.length / itemsPerPage);
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      pageNumbers.push(
        <li key="prev" onClick={() => setCurrentPage(currentPage - 1)}>
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
    }

    return pageNumbers;
  };

  const [answers, setAnswers] = useState({
    complianceSOP: null,
    activeListening: null,
    correctDetails: null,
    addressTagging: null,
    callHandlingTime: null,
    remark: "",
  });

  const handleButtonClick = (question, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted answers:", answers);
    // Implement your API call here to send answers to database
    const formData = {
      ...answers,
      // eventId: eventId, // Use eventId from props
    };

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
          <div className="white_card mb_20">
            <table className="table call-logs-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Username</th>
                  <th>Event Type</th>
                  <th>Event Subtype</th>
                  <th>Call Duration</th>
                  <th>Review Status</th>
                  <th>Play</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((file) => (
                  <tr key={file.id}>
                    <td>{file.id}</td>
                    <td>{file.username}</td>
                    <td>{file.eventType}</td>
                    <td>{file.eventSubtype}</td>
                    <td>{file.callDuration}</td>
                    <td>{file.reviewStatus}</td>
                    <td>
                      <button onClick={() => handlePlayPause(file.src)}>
                        {currentAudio === file.src && isPlaying ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul id="page-numbers">{renderPageNumbers()}</ul>
          </div>
        </div>
        

        <div className="call-logs-container">
          <h1 className="admin-title">Actionable Call Logs</h1>
          <div className="call-logs-content">
            <div className="content-side">
              <div className="audio-player-section">
                <p>Audio title will come here </p>
                <AudioPlayer
                  src={currentAudio}
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
              <div className="call-information">
                <table>
                  <tbody>
                    <tr>
                      <td>Address:</td>
                      <td>Panchkula</td>
                    </tr>
                    <tr>
                      <td>Event Type:</td>
                      <td>Accident</td>
                    </tr>
                    <tr>
                      <td>Incident Time:</td>
                      <td>12 PM</td>
                    </tr>
                    <tr>
                      <td>Reported By:</td>
                      <td>Mrunal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-lg-12 col-md-12 col-sm-12 card_height_100 p-5">
                <div className="wrapper">
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
                        value="d"
                        readOnly
                      ></textarea>
                    </div>

                    <div className="form-group-row therating">
                      <label
                        className="col-6 starlabel"
                        htmlFor="complianceSOP"
                      >
                        1) Compliance of SOP
                      </label>
                      <div className="container col-12">
                        <div className="mt-3">
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
                              answers.complianceSOP === "Average"
                                ? "btn-warning"
                                : ""
                            }`}
                            onClick={() =>
                              handleButtonClick("complianceSOP", "Average")
                            }
                          >
                            Average
                          </button>
                          <button
                            className={`btn me-2 ${
                              answers.complianceSOP === "Good"
                                ? "btn-primary"
                                : ""
                            }`}
                            onClick={() =>
                              handleButtonClick("complianceSOP", "Good")
                            }
                          >
                            Good
                          </button>
                          <button
                            className={`btn ${
                              answers.complianceSOP === "Excellent"
                                ? "btn-success"
                                : ""
                            }`}
                            onClick={() =>
                              handleButtonClick("complianceSOP", "Excellent")
                            }
                          >
                            Excellent
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Repeat similar blocks for other questions */}
                    <div className="form-group">
                      <button
                        onClick={handleSubmit}
                        className="btn btn-primary"
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
    </div>
    </div>
  );
};

export default Actionablecalls;
