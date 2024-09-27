import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faInfoCircle,
  faSpinner,
  faCheckDouble,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css"; // Ensure this CSS is imported
import Swal from "sweetalert2";
import {
  fetchCallData,
  formatDurationMinutesSeconds,
  postData,
} from "../../utils/exportUtils";
import withReactContent from "sweetalert2-react-content";

export default function Callsdata({ currentCallId, setCurrentCallId, ws }) {
  // State variables
  const [tableData, setTableData] = useState([]); // Holds the fetched data for the table
  const [currentAudio, setCurrentAudio] = useState(null); // Stores the currently playing audio
  const [isPlaying, setIsPlaying] = useState(false); // Indicates whether an audio is currently playing
  const [paginatedData, setPaginatedData] = useState([]); // Stores the data for the current page of the table
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page of the table
  const [signalId, setSignalId] = useState(null); // Stores the current signal ID
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicates if a form submission is in progress
  const [fetchKey, setFetchKey] = useState(0); // Key to trigger data fetch
  const [timer, setTimer] = useState(0); // Timer to track elapsed time
  const [scoQaTime, setScoQaTime] = useState(null); // Stores the SCO QA time value
  const [socket, setSocket] = useState(null); // WebSocket state
  const timerRef = useRef(null); // Ref to keep track of the timer
  const [processingCalls, setProcessingCalls] = useState({}); // Holds the status of processing calls
  const socketRef = useRef(null); // Ref for the socket
  const [isSocketReady, setIsSocketReady] = useState(false); // Indicates if the WebSocket connection is ready
  const [currentProcessingCallId, setCurrentProcessingCallId] = useState(null); // Stores the current processing call ID
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [activeCallId, setActiveCallId] = useState(null); // Tracks the currently active call ID
  const location = useLocation(); // Hook to access the current location
  const itemsPerPage = 10; // Number of items to display per page in the table
  const query = new URLSearchParams(useLocation().search); // Parses the query parameters from the URL
  const signal_type = query.get("signal_type"); // Retrieves the signal type from the query parameters
  const callType = query.get("type"); // Retrieves the call type from the query parameters
  const employeeCode = localStorage.getItem("username"); // Gets the current user's employee code from local storage

  // Base URL for audio files
  const AUDIO_BASE_URL =
    "http://10.26.0.8:8080/ACDSAdmin-1.2/AudioDownloadServlet?absoluteFileName=";
  const role = localStorage.getItem("role"); // Gets the current user's role from local storage

  // Initial form field values
  const initialAnswers = {
    sopScore: null,
    activeListeningScore: null,
    releventDetailScore: null,
    addressTaggingScore: null,
    callHandledTimeScore: null,
    scoEmployeeCode: employeeCode, // Set the SCO employee code
    scoQaTime: "",
    scoRemarks: "",
  };

  // Effect to manage WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/"); // Initialize WebSocket connection

    ws.onopen = () => {
      console.log("WebSocket connected"); // Log connection status
      setIsSocketReady(true); // Update socket readiness status
    };

    // Handle incoming messages from the WebSocket
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data); // Parse incoming message

      // Check for initial data message
      if (data.type === "INITIAL_DATA") {
        const initialStatus = {};
        for (const [callId, status] of Object.entries(data.data)) {
          initialStatus[callId] = {
            status: status.status,
            employeeCode: status.employeeCode,
          };
        }
        setProcessingCalls(initialStatus); // Set the initial processing calls state
      } else if (data.type === "STATUS_UPDATE") {
        // Handle status updates
        const { callId, status, employeeCode } = data;

        // Update the processing calls with the new status
        setProcessingCalls((prev) => ({
          ...prev,
          [callId]: { status, employeeCode },
        }));

        // Update the paginated data to reflect the new status
        const callIndex = paginatedData.findIndex(
          (item) => item.signal_id === callId
        );
        if (callIndex !== -1) {
          const updatedData = [...paginatedData];
          updatedData[callIndex] = {
            ...paginatedData[callIndex],
            reviewStatus: status,
          };
          setPaginatedData(updatedData); // Set updated paginated data
        }
      }
    };

    // Handle WebSocket close event
    ws.onclose = () => {
      console.log("WebSocket disconnected"); // Log disconnection status
      setIsSocketReady(false); // Update socket readiness status
    };
    setSocket(ws); // Set the WebSocket instance

    // Handle cleanup on page unload
    const handleBeforeUnload = () => {
      if (currentProcessingCallId) {
        // Send the STOP_PROCESSING message directly, ignoring WebSocket state
        try {
          ws.send(
            JSON.stringify({
              type: "STOP_PROCESSING",
              callId: currentProcessingCallId,
              employeeCode,
            })
          );
        } catch (error) {
          console.log("Error sending STOP_PROCESSING message:", error);
        }

        // Close the WebSocket connection (forcing cleanup)
        ws.close();
      }
    };

    // Listen for page unload (tab close, refresh, or navigation)
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up WebSocket connection and listeners when the component unmounts
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (currentProcessingCallId && ws.readyState === WebSocket.OPEN) {
        // Ensure STOP_PROCESSING is sent before unmount
        ws.send(
          JSON.stringify({
            type: "STOP_PROCESSING",
            callId: currentProcessingCallId,
            employeeCode,
          })
        );
      }

      // Close the WebSocket connection
      ws.close();
    };
  }, [currentProcessingCallId, employeeCode]); // Dependencies for effect

  // Function to send a message through the WebSocket
  const sendMessage = (message) => {
    if (isSocketReady && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message)); // Send the message as JSON
    }
  };

  // Function to handle audio play/pause button click
  const handlePlayPause = (call) => {
    const callId = call.signal_id; // Get the signal ID from the call

    // Start the new event by sending a message
    sendMessage({
      type: "START_PROCESSING",
      callId,
      employeeCode,
    });

    // Update state locally to indicate processing status
    setProcessingCalls((prev) => ({
      ...prev,
      [callId]: { status: "Processing", employeeCode },
    }));

    setActiveCallId(callId); // Update active call ID
    setCurrentProcessingCallId(callId); // Store the latest call as the current one
    setIsPlaying((prevPlaying) => !prevPlaying); // Toggle play state
    setCurrentAudio(call.src); // Set current audio source
    setSignalId(callId); // Set current signal ID
  };

  // Effect to fetch data and transform the response
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data...");

      setLoading(true); // Set loading state
      try {
        const response = await fetchCallData(signal_type); // Fetch call data

        // Check if response is valid
        if (response && Array.isArray(response)) {
          // Transform response data for table
          const transformedData = response
            .filter((item) => item.event_maintype !== "NULL")
            .map((item) => ({
              id: item.id,
              eventId: item.event_id,
              reviewStatus: item.review_status,
              src1: item.voice_path,
              src: `${AUDIO_BASE_URL}${item.voice_path}`, // Corrected line to create audio URL
              callDuration: formatDurationMinutesSeconds(
                item.call_duration_millis // Format duration
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
              processing: false, // Initialize processing state
              eventType: item.event_maintype,
              eventSubtype: item.event_subtype,
            }));
          setTableData(transformedData); // Update table data state
        } else {
          console.error("Unexpected response format:", response); // Log unexpected response format
        }
      } catch (error) {
        console.error("Error fetching data:", error); // Log any fetching errors
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    fetchData(); // Call fetch data function
  }, [currentPage, signal_type, fetchKey]); // Dependencies for effect

  // Effect to update paginated data based on current page and items per page
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage; // Calculate start index
    const end = start + itemsPerPage; // Calculate end index
    setPaginatedData(tableData.slice(start, end)); // Update paginated data based on sliced table data
  }, [tableData, currentPage]); // Dependencies for effect

  // Timer logic: Check if the timer exceeds 15 minutes (900 seconds)
  useEffect(() => {
    if (timer >= 900) {
      alert("Time limit exceeded! Please submit the form.");
      clearInterval(timerRef.current);
    }
  }, [timer]);

  // Handle play/pause action for the audio
  // const handlePlayPause = (call) => {
  //   const callId = call.signal_id;

  //   if (currentProcessingCallId && currentProcessingCallId !== callId) {
  //     sendMessage({
  //       type: "UPDATE_STATUS",
  //       callId: currentProcessingCallId,
  //       status: "Stopped",
  //       employeeCode: employeeCode,
  //     });

  //     const previousIndex = paginatedData.findIndex(
  //       (item) => item.signal_id === currentProcessingCallId
  //     );
  //     if (previousIndex !== -1) {
  //       const updatedData = [...paginatedData];
  //       updatedData[previousIndex] = {
  //         ...paginatedData[previousIndex],
  //         reviewStatus: "Stopped",
  //       };
  //       setPaginatedData(updatedData);
  //     }
  //   }

  //   sendMessage({
  //     type: "START_PROCESSING",
  //     eventId: callId,
  //     employeeCode,
  //   });

  //   setProcessingCalls((prev) => ({
  //     ...prev,
  //     [callId]: { status: "Processing", employeeCode },
  //   }));

  //   setActiveCallId(callId);
  //   setCurrentProcessingCallId(callId);
  //   setIsPlaying((prevPlaying) => !prevPlaying);
  //   setCurrentAudio(call.src);
  //   setSignalId(callId);
  // };

  // Handle play/pause action for the audio
  // const handlePlayPause = (call) => {
  //   const callId = call.signal_id;

  //   // If a different call is being processed, stop the previous one
  //   if (currentProcessingCallId && currentProcessingCallId !== callId) {
  //     // Notify the server to stop the previous event
  //     sendMessage({
  //       type: "STOP_PROCESSING",
  //       callId: currentProcessingCallId,
  //       employeeCode: employeeCode,
  //     });

  //     // Stop the previous event locally
  //     setProcessingCalls((prev) => ({
  //       ...prev,
  //       [currentProcessingCallId]: { status: "Stopped", employeeCode: prev[currentProcessingCallId].employeeCode },
  //     }));

  //     // Update the table for the previous event
  //     const previousIndex = paginatedData.findIndex(item => item.signal_id === currentProcessingCallId);
  //     if (previousIndex !== -1) {
  //       const updatedData = [...paginatedData];
  //       updatedData[previousIndex] = {
  //         ...updatedData[previousIndex],
  //         reviewStatus: "Stopped",
  //       };
  //       setPaginatedData(updatedData);
  //     }
  //   }

  //   // Start the new event
  //   sendMessage({
  //     type: "START_PROCESSING",
  //     callId,
  //     employeeCode,
  //   });

  //   // Mark the new event as processing
  //   setProcessingCalls((prev) => ({
  //     ...prev,
  //     [callId]: { status: "Processing", employeeCode },
  //   }));

  //   setActiveCallId(callId); // Update active call ID
  //   setCurrentProcessingCallId(callId); // Store the latest call as the current one
  //   setIsPlaying((prevPlaying) => !prevPlaying);
  //   setCurrentAudio(call.src);
  //   setSignalId(callId);
  // };

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

// Function to handle submission of form data
const handleSubmit = async (event) => {
  event.preventDefault(); // Prevent default form submission behavior
  setIsSubmitting(true); // Set submitting state

  try {
    const response = await fetch("your_api_endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify content type
      },
      body: JSON.stringify(initialAnswers), // Prepare data for submission
    });

    if (!response.ok) {
      throw new Error("Network response was not ok"); // Handle response error
    }
    console.log("Form submitted successfully"); // Log success message
  } catch (error) {
    console.error("Error submitting form:", error); // Log any submission errors
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

  const MySwal = withReactContent(Swal); // Wrap SweetAlert for React

  //Function to show the details of a call list
  const handleInfoClick = (call) => {
    MySwal.fire({
      title: "Call Information",
      html: `
          <div class="swal-custom-container">
            <div class="swal-info">
              <div class="info-row" style="display: ${
                role === "admin" ? "none" : "block"
              }">
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
        popup: "swal-custom-style", // Ensures that custom styling applies only to this popup
        container: "swal-custom-container",
        title: "swal-title",
        content: "swal-content",
        confirmButton: "swal-confirm-button",
      },
      position: "top-start", // Position on the left-hand side
      allowOutsideClick: false, // Prevent the popup from closing on outside click
      allowEscapeKey: false, // Disable closing with the ESC key
      allowEnterKey: false, // Disable closing with the Enter key
      backdrop: false, // Disable the backdrop so it doesn't close when clicking outside
      didOpen: () => {
        // Make the Sweetf popup draggable
        const draggableElement = Swal.getPopup();
        draggableElement.setAttribute("draggable", "true");

        draggableElement.addEventListener("dragstart", (event) => {
          const style = window.getComputedStyle(event.target, null);
          event.dataTransfer.setData(
            "text/plain",
            parseInt(style.getPropertyValue("left"), 10) -
              event.clientX +
              "," +
              (parseInt(style.getPropertyValue("top"), 10) - event.clientY)
          );
        });

        document.body.addEventListener("dragover", (event) => {
          event.preventDefault();
        });

        document.body.addEventListener("drop", (event) => {
          event.preventDefault();
          const offset = event.dataTransfer.getData("text/plain").split(",");
          const draggableElement = Swal.getPopup();
          draggableElement.style.left =
            event.clientX + parseInt(offset[0], 10) + "px";
          draggableElement.style.top =
            event.clientY + parseInt(offset[1], 10) + "px";
        });
      },
    });
  };

  // Apply CSS classes based on status
  const getStatusClass = (status) => {
    if (status === "Processing") return "text-warning font-weight-bold";
    return "";
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
                  {loading ? (
                    <div className="alert alert-info mt-4 mr-5">Loading...</div>
                  ) : (
                    <table className="table table-striped table-bordered call-logs-table ml-4">
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
                        {paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              <div className="alert alert-info">
                                No record found in {callType}.
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((call, index) => {
                            const reviewStatus = call.reviewStatus
                              ? call.reviewStatus.trim().toLowerCase()
                              : "";
                            const isCompleted = reviewStatus === "completed";
                            const isPlayingCurrent =
                              isPlaying && currentAudio === call.src;
                            const processingInfo =
                              processingCalls[call.signal_id];
                            const isProcessing =
                              processingInfo &&
                              processingInfo.status === "Processing";
                            const isMyProcessing =
                              processingInfo &&
                              processingInfo.employeeCode === employeeCode;
                            return (
                              <tr
                                key={call.signal_id}
                                className={
                                  activeCallId === call.signal_id
                                    ? "highlight-row"
                                    : ""
                                }
                              >
                                <td>{index + 1}</td>
                                <td>{call.eventType}</td>
                                <td>{call.eventSubtype}</td>
                                <td>{call.callDuration}</td>
                                <td>
                                  <span
                                    className={`${
                                      reviewStatus === "completed"
                                        ? "text-success font-weight-bold d-flex flex-column justify-content-center align-items-center" // Completed status in green
                                        : isProcessing && !isMyProcessing
                                        ? "text-warning font-weight-bold" // Processing status in warning color
                                        : processingInfo &&
                                          processingInfo.status === "Pending" // Check for Pending status
                                        ? "text-danger font-weight-bold" // Pending status in red
                                        : getStatusClass(
                                            processingInfo
                                              ? processingInfo.status
                                              : "Pending"
                                          ) // Call existing function for other statuses
                                    }`}
                                  >
                                    {reviewStatus === "completed" ? (
                                      <FontAwesomeIcon icon={faCheckDouble} /> // Display 'Completed' when call.reviewStatus is completed
                                    ) : isProcessing && !isMyProcessing ? (
                                      `Processing by ${
                                        processingInfo?.employeeCode ||
                                        "Unknown"
                                      }`
                                    ) : processingInfo ? (
                                      processingInfo.status
                                    ) : (
                                      <span className="text-danger font-weight-bold d-flex flex-column justify-content-center align-items-center">
                                        <FontAwesomeIcon
                                          icon={faHourglassHalf}
                                        />{" "}
                                        Pending...
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <button
                                      className="btn btn-outline-info me-2"
                                      onClick={() => handleInfoClick(call)}
                                      disabled={isCompleted}
                                    >
                                      <FontAwesomeIcon icon={faInfoCircle} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!isCompleted) {
                                          handlePlayPause(call, index);
                                        }
                                      }}
                                      className={`btn btn-outline-primary me-2 ${
                                        isCompleted
                                          ? "disabled btn-outline-secondary"
                                          : ""
                                      }`}
                                      disabled={isCompleted || isProcessing}
                                    >
                                      {isProcessing ? (
                                        <FontAwesomeIcon
                                          icon={faSpinner}
                                          spin
                                        />
                                      ) : (
                                        <FontAwesomeIcon
                                          icon={
                                            isPlayingCurrent ? faPause : faPlay
                                          }
                                        />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  )}

                  <ul
                    id="page-numbers"
                    className="pagination justify-content-end"
                  >
                    {renderPageNumbers()}
                  </ul>
                </div>
              </div>

              <div className="col-lg-6 ">
                <div className="row">
                  <div className="white_card mb-20">
                    <div className="mr-3 text-lg-right">
                      Timer: {formatTime(timer)}{" "}
                      {/* Display the running timer */}
                    </div>
                    <div className="audio-player-section p-20">
                      <AudioPlayer
                        src={currentAudio}
                        autoPlay={isPlaying}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="white_card mb-20">
                    <div className="wrapper ml-3 white_card mb-20 mt-3">
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
                                    answers.sopScore === "2"
                                      ? "btn-warning"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleButtonClick("sopScore", "2")
                                  }
                                >
                                  Good
                                </button>
                                <button
                                  className={`btn me-2 ${
                                    answers.sopScore === "3"
                                      ? "btn-primary"
                                      : ""
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
                                    handleButtonClick(
                                      "activeListeningScore",
                                      "1"
                                    )
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
                                    handleButtonClick(
                                      "activeListeningScore",
                                      "2"
                                    )
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
                                    handleButtonClick(
                                      "activeListeningScore",
                                      "3"
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
                                    handleButtonClick(
                                      "releventDetailScore",
                                      "1"
                                    )
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
                                    handleButtonClick(
                                      "releventDetailScore",
                                      "2"
                                    )
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
                                    handleButtonClick(
                                      "releventDetailScore",
                                      "3"
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
                                    handleButtonClick(
                                      "addressTaggingScore",
                                      "1"
                                    )
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
                                    handleButtonClick(
                                      "addressTaggingScore",
                                      "2"
                                    )
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
                                    handleButtonClick(
                                      "addressTaggingScore",
                                      "3"
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
                                    handleButtonClick(
                                      "callHandledTimeScore",
                                      "1"
                                    )
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
                                    handleButtonClick(
                                      "callHandledTimeScore",
                                      "2"
                                    )
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
                                    handleButtonClick(
                                      "callHandledTimeScore",
                                      "3"
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
      </div>
    </>
  );
}
