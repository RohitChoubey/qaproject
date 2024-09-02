import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlay, faPause, faInfoCircle,} from "@fortawesome/free-solid-svg-icons";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css"; // Ensure this CSS is imported
import Swal from "sweetalert2";
import {getData, formatDurationMinutesSeconds, postData,} from "../../utils/exportUtils";

export default function Callsdata() {
  const [tableData, setTableData] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [signalId, setSignalId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button
  const [fetchKey, setFetchKey] = useState(0); // Key to trigger fetch
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [scoQaTime, setScoQaTime] = useState(null);
  const timerRef = React.useRef(null);

  const itemsPerPage = 10;
  const query = new URLSearchParams(useLocation().search);
  const signal_type = query.get("signal_type");
  const callType = query.get("type");

  // Initial form field values
  const initialAnswers = {
    sopScore: null,
    activeListeningScore: null,
    releventDetailScore: null,
    addressTaggingScore: null,
    callHandledTimeScore: null,
    scoEmployeeCode: localStorage.getItem("username"),
    scoQaTime: "",
    scoRemarks: "",
  };

  // Fetch data whenever `currentPage`, `signal_type`, or `fetchKey` changes
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data...");

      try {
        // Use the getData function to fetch the data
        const response = await getData(
          `/call-data?page=${currentPage}&limit=${itemsPerPage}&signalType=${signal_type}`
        );
        if (response && Array.isArray(response)) {
          const transformedData = response.map((item) => ({
            id: item.id,
            eventId: item.event_id,
            eventType: item.event_maintype,
            eventSubtype: item.event_subtype,
            reviewStatus: item.review_status,
            src: item.voice_path,
            callDuration: formatDurationMinutesSeconds(
              item.call_duration_millis
            ),
            signal_id: item.signal_id,
            call_pick_duration_millis: item.call_pick_duration_millis,
            event_registration_time: item.event_registration_time,
            priority: item.priority,
            district_code: item.district_code,
            victim_name: item.victim_name,
            victim_age: item.victim_age,
            victim_gender: item.victim_gender,
            victim_address: item.victim_address,
            addl_info: item.addl_info,
            near_ps: item.near_ps,
          }));

          setTableData(transformedData);
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage, signal_type, fetchKey]); // Include `fetchKey` to trigger fetch

  // Pagination: Update the paginated data based on current page
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedData(tableData.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, tableData]);

  // Timer: Check if the timer exceeds 15 minutes (900 seconds) and alert if it does
  useEffect(() => {
    if (timer >= 900) {
      alert("Time limit exceeded! Please submit the form.");
      clearInterval(timerRef.current); // Stop the timer if limit exceeded
    }
  }, [timer]);

  // Handle play/pause action for the audio
  const handlePlayPause = (src, id) => {
    if (!isPlaying) {
      // If not currently playing
      setCurrentAudio(src); // Set current audio source
      setIsPlaying(true); // Mark as playing
      setSignalId(id); // Set signal ID

      if (!timerRef.current) {
        // Start the timer if it's not already running
        timerRef.current = setInterval(() => {
          setTimer((prevTimer) => prevTimer + 1); // Increment timer every second
        }, 1000);
      }
    }
  };

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

  const [answers, setAnswers] = useState(initialAnswers);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    clearInterval(timerRef.current); // Stop the timer
    setScoQaTime(timer); // Save the final time to scoQaTime

    // Reset the timer to 0
    setTimer(0);
    timerRef.current = null; // Clear the timer reference

    // Check for missing required fields
    const requiredFields = [
      "sopScore",
      "activeListeningScore",
      "addressTaggingScore",
      "releventDetailScore",
      "callHandledTimeScore",
    ];
    const missingFields = requiredFields.filter((field) => !answers[field]);

    // Validation checks
    if (signalId === null) {
      Swal.fire({
        icon: "error",
        title: "Listen to Recording First",
        text: "Please listen to the audio before rating.",
      });
      return;
    } else if (missingFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "All Required Fields Must Be Provided",
        text: "Please fill in all required fields before submitting.",
      });
      return;
    }

    setIsSubmitting(true); // Indicate that form submission is in progress
    try {
      // Use the postData utility function to post the data
      await postData("/create-coqa-data", {
        ...answers,
        scoQaTime: timer,
        signalId,
      });
      setFetchKey((prevKey) => prevKey + 1); // Trigger a data refresh
      setAnswers(initialAnswers); // Reset the form fields
      setSignalId(null); // Clear signal ID if needed
      Swal.fire({ icon: "success", title: "Submitted Successfully!" }); // Show success message
    } catch (error) {
      console.error("Error submitting data:", error); // Handle submission error
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Function to format timer into minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  //Function to show the details of a call list
  const handleInfoClick = (call) => {
    Swal.fire({
      title: "Call Information",
      html: `
          <div class="swal-custom-container">
            <div class="swal-info">
              <div class="info-row">
                <strong>Signal Information:</strong>
                <span>${call.signal_id || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Call Pick Duration:</strong>
                <span>${
                  call.call_pick_duration_millis
                    ? formatDurationMinutesSeconds(
                        call.call_pick_duration_millis
                      )
                    : "N/A"
                }</span>
              </div>
              <div class="info-row">
                <strong>Event Registration Time:</strong>
                <span>${call.event_registration_time || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Priority:</strong>
                <span class="priority" style="
                  font-weight: bold; 
                  color: ${
                    call.priority.toLowerCase() === "emergency"
                      ? "red"
                      : call.priority.toLowerCase() === "high"
                      ? "orange"
                      : call.priority.toLowerCase() === "low"
                      ? "green"
                      : "black"
                  };
                ">
                  ${call.priority || "N/A"}
                </span>

              </div>
              <div class="info-row">
                <strong>District:</strong>
                <span>${call.district_code || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Victim Name:</strong>
                <span>${call.victim_name || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Victim Age:</strong>
                <span>${call.victim_age || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Victim Gender:</strong>
                <span>${
                  call.victim_gender === "M"
                    ? "Male"
                    : call.victim_gender === "F"
                    ? "Female"
                    : "N/A"
                }</span>
              </div>
              <div class="info-row">
                <strong>Victim Address:</strong>
                <span>${call.victim_address || "N/A"}</span>
              </div>
              <div class="info-row">
                <strong>Additional Information:</strong>
                <div class="addl-info">
                  ${
                    call.addl_info
                      ? call.addl_info.replace(/\.\.\./g, "<br>")
                      : "N/A"
                  }
                </div>
              </div>
              <div class="info-row">
                <strong>Near PS:</strong>
                <span>${call.near_ps || "N/A"}</span>
              </div>
            </div>
          </div>
        `,
      confirmButtonText: "Close",
      customClass: {
        popup: "swal-custom-style", // Ensure the new custom style applies only to this popup
        container: "swal-custom-container",
        title: "swal-title",
        content: "swal-content",
        confirmButton: "swal-confirm-button",
      },
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
                  <h3 className="f_s_30 f_w_700 text_white">{callType}</h3>
                  <ol className="breadcrumb page_bradcam mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Call logs</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      <Link to="#">{callType}</Link>
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
                  <table className="table  table-striped table-bordered call-logs-table ml-4">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Event Type</th>
                        <th>Event Subtype</th>
                        <th>Call Duration</th>
                        <th>Review Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((call, index) => {
  const reviewStatus = call.reviewStatus ? call.reviewStatus.toLowerCase() : "";
  const isCompleted = reviewStatus === "completed";
  const isPending = reviewStatus === "pending";
  const isPlayingCurrent = isPlaying && currentAudio === call.src;

  return (
    <tr
      key={call.id}
      style={{
        backgroundColor: isCompleted ? "#055160" : "",
        color: isCompleted ? "#ffffff" : "" // Set text color to white for contrast
      }}
    >
      <td>{index + 1}</td>
      <td>{call.eventType}</td>
      <td>{call.eventSubtype}</td>
      <td>{call.callDuration}</td>
      <td>
        <span
          className={
            isPending
              ? "text-danger font-weight-bold"
              : isCompleted
              ? "text-success font-weight-bold" // Ensure .text-success applies green color
              : ""
          }
        >
          {call.reviewStatus}
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-info me-2"
            onClick={() => handleInfoClick(call)}
            disabled={isCompleted} // Disable when completed
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </button>
          <button
            onClick={() => {
              if (!isCompleted) {
                handlePlayPause(call.src, call.signal_id);
              }
            }}
            className={`btn btn-outline-primary me-2 ${
              isCompleted ? "disabled btn-outline-secondary" : ""
            }`}
            disabled={isCompleted} // Disable when completed
          >
            <FontAwesomeIcon
              icon={isPlayingCurrent ? faPause : faPlay}
            />
          </button>
        </div>
      </td>
    </tr>
  );
})}


                    </tbody>
                  </table>

                  <ul
                    id="page-numbers"
                    className="pagination justify-content-end"
                  >
                    {renderPageNumbers()}
                  </ul>
                </div>
              </div>

              <div className="col-lg-6 ">
                <div className="white_card mb-20">
                  <div className="mr-3 text-lg-right">
                    Timer: {formatTime(timer)} {/* Display the running timer */}
                  </div>
                  <div className="audio-player-section p-20">
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
                      {/* <div className="form-group-row">
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
                        </div> */}

                      <div className="container">
                        <div className="row mb-3">
                          <div className="col-6">
                            <label className="form-label" htmlFor="sopScore">
                              1) Compliance of SOP
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.sopScore === "1" ? "btn-danger" : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("sopScore", "1")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.sopScore === "2" ? "btn-warning" : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("sopScore", "2")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.sopScore === "3" ? "btn-primary" : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("sopScore", "3")
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
                              htmlFor="activeListeningScore"
                            >
                              2) Active Listening & Proper response
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListeningScore === "1"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("activeListeningScore", "1")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListeningScore === "2"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("activeListeningScore", "2")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.activeListeningScore === "3"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("activeListeningScore", "3")
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
                              htmlFor="releventDetailScore"
                            >
                              3) Correct And Relevant Details Capturing
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.releventDetailScore === "1"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("releventDetailScore", "1")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.releventDetailScore === "2"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("releventDetailScore", "2")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.releventDetailScore === "3"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("releventDetailScore", "3")
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
                              htmlFor="releventDetailScore"
                            >
                              4) Correct Address Tagging
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTaggingScore === "1"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("addressTaggingScore", "1")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTaggingScore === "2"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("addressTaggingScore", "2")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.addressTaggingScore === "3"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("addressTaggingScore", "3")
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
                              htmlFor="callHandledTimeScore"
                            >
                              5) Call Handled Time
                            </label>
                          </div>
                          <div className="col-6">
                            <div>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandledTimeScore === "1"
                                    ? "btn-danger"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("callHandledTimeScore", "1")
                                }
                              >
                                Poor
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandledTimeScore === "2"
                                    ? "btn-warning"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("callHandledTimeScore", "2")
                                }
                              >
                                Good
                              </button>
                              <button
                                className={`btn me-2 ${
                                  answers.callHandledTimeScore === "3"
                                    ? "btn-primary"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("callHandledTimeScore", "3")
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
                          value={answers.scoRemarks}
                          onChange={(e) =>
                            setAnswers((prevAnswers) => ({
                              ...prevAnswers,
                              scoRemarks: e.target.value,
                            }))
                          }
                        ></textarea>
                      </div>
                      <button
                        className="btn btn-primary mt-3 mb-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}{" "}
                        {/* Show loading indicator */}
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
