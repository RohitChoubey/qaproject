import React, { useState, useEffect, useRef } from "react";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../assets/css/mediaplayer.css"; // Ensure you have the required styles
import Swal from "sweetalert2";

export default function Mediaplayer({
  selectedTrackIndex,
  eventId, // Updated prop name
}) {
  const [index, setIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [pause, setPause] = useState(false);
  const isDisabled = eventId == null;

  const [musicList] = useState([
    {
      name: "Nice piano and ukulele",
      author: "Royalty",
      audio: "https://www.bensound.com/bensound-music/bensound-buddy.mp3",
      duration: "2:02",
    },
    {
      name: "Gentle acoustic",
      author: "Acoustic",
      audio: "https://www.bensound.com//bensound-music/bensound-sunny.mp3",
      duration: "2:20",
    },
    {
      name: "Corporate motivational",
      author: "Corporate",
      audio: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
      duration: "2:59",
    },
    {
      name: "Slow cinematic",
      author: "Royalty",
      audio: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
      duration: "3:26",
    },
  ]);

  const [answers, setAnswers] = useState({
    complianceSOP: null,
    activeListening: null,
    correctDetails: null,
    addressTagging: null,
    callHandlingTime: null,
    remark: "",
  });

  useEffect(() => {
    if (selectedTrackIndex !== null) {
      setIndex(selectedTrackIndex);
      updatePlayer();
      if (!pause) {
        playerRef.current.play();
        setPause(true);
      }
    }
  }, [selectedTrackIndex]);

  useEffect(() => {
    const player = playerRef.current;
    const timeline = timelineRef.current;

    player.addEventListener("timeupdate", timeUpdate, false);
    player.addEventListener("ended", nextSong, false);
    timeline.addEventListener("click", changeCurrentTime, false);
    timeline.addEventListener("mousemove", hoverTimeLine, false);
    timeline.addEventListener("mouseout", resetTimeLine, false);

    return () => {
      player.removeEventListener("timeupdate", timeUpdate);
      player.removeEventListener("ended", nextSong);
      timeline.removeEventListener("click", changeCurrentTime);
      timeline.removeEventListener("mousemove", hoverTimeLine);
      timeline.removeEventListener("mouseout", resetTimeLine);
    };
  }, []);

  const playerRef = useRef(null);
  const timelineRef = useRef(null);
  const playheadRef = useRef(null);
  const hoverPlayheadRef = useRef(null);

  const changeCurrentTime = (e) => {
    const duration = playerRef.current.duration;
    const playheadWidth =
      timelineRef.current.offsetWidth - playheadRef.current.offsetWidth;
    const userClickWidth = e.clientX - getPosition(timelineRef.current);
    const userClickWidthInPercent = (userClickWidth * 100) / playheadWidth;
    playheadRef.current.style.width = userClickWidthInPercent + "%";
    playerRef.current.currentTime = (duration * userClickWidthInPercent) / 100;
  };

  const getPosition = (el) => {
    return el.getBoundingClientRect().left;
  };

  const hoverTimeLine = (e) => {
    const duration = playerRef.current.duration;
    const playheadWidth =
      timelineRef.current.offsetWidth - playheadRef.current.offsetWidth;
    const userClickWidth = e.clientX - getPosition(timelineRef.current);
    const userClickWidthInPercent = (userClickWidth * 100) / playheadWidth;

    if (userClickWidthInPercent >= 0 && userClickWidthInPercent <= 100) {
      hoverPlayheadRef.current.style.width = userClickWidthInPercent + "%";
    }

    const time = (duration * userClickWidthInPercent) / 100;

    if (time >= 0 && time <= duration) {
      hoverPlayheadRef.current.dataset.content = formatTime(time);
    }
  };

  const resetTimeLine = () => {
    hoverPlayheadRef.current.style.width = 0;
  };

  const timeUpdate = () => {
    const duration = playerRef.current.duration;
    const playheadWidth =
      timelineRef.current.offsetWidth - playheadRef.current.offsetWidth;
    const playPercent = 100 * (playerRef.current.currentTime / duration);
    playheadRef.current.style.width = playPercent + "%";
    const currentTimeFormatted = formatTime(
      parseInt(playerRef.current.currentTime)
    );
    setCurrentTime(currentTimeFormatted);
  };

  const formatTime = (currentTime) => {
    const minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    seconds = seconds >= 10 ? seconds : "0" + (seconds % 60);
    return minutes + ":" + seconds;
  };

  const updatePlayer = () => {
    playerRef.current.load();
  };

  const nextSong = () => {
    setIndex((index + 1) % musicList.length);
    updatePlayer();
    if (pause) {
      playerRef.current.play();
    }
  };

  const prevSong = () => {
    setIndex((index + musicList.length - 1) % musicList.length);
    updatePlayer();
    if (pause) {
      playerRef.current.play();
    }
  };

  const playOrPause = () => {
    if (!pause) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
    setPause(!pause);
  };

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
    // Example using fetch API:
    const formData = {
      ...answers,
      eventId: eventId, // Use eventId from props
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
        // console.log("Success:", data);
        Swal.fire({
          icon: "success",
          title: "Submitted Successfully!",
          text: `Response Submitted successfully `,
        });
        // Handle success, e.g., show a success message or navigate to another page
      })
      .catch((error) => {
        // console.error("Error:", error);
        // Handle error, e.g., show an error message
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "There was an error updating the data. Please try again.",
        });
      });
    // Here you would typically send `formData` to your API
  };
  return (
    <>
      <div
        className="row"
        style={{
          pointerEvents: isDisabled ? "none" : "auto",
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <div className="row">
          <div className="col-12 mt-4">
            <div className="card">
              <div className="current-song">
                <audio ref={playerRef}>
                  <source src={musicList[index].audio} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
                <span className="song-name">{musicList[index].name}</span>
                <span className="song-author">{musicList[index].author}</span>
                <div className="time">
                  <div className="current-time">{currentTime}</div>
                  <div className="end-time">{musicList[index].duration}</div>
                </div>
                <div ref={timelineRef} id="timeline">
                  <div ref={playheadRef} id="playhead"></div>
                  <div
                    ref={hoverPlayheadRef}
                    className="hover-playhead"
                    data-content="0:00"
                  ></div>
                </div>
                <div className="controls">
                  <button
                    onClick={prevSong}
                    className="prev prev-next current-btn"
                  >
                    <FontAwesomeIcon icon={faBackward} />
                  </button>
                  <button onClick={playOrPause} className="play current-btn">
                    {!pause ? (
                      <FontAwesomeIcon icon={faPlay} />
                    ) : (
                      <FontAwesomeIcon icon={faPause} />
                    )}
                  </button>
                  <button
                    onClick={nextSong}
                    className="next prev-next current-btn"
                  >
                    <FontAwesomeIcon icon={faForward} />
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  value={eventId}
                  readOnly
                ></textarea>
              </div>

              <div className="form-group-row therating">
                <label className="col-6 starlabel" htmlFor="complianceSOP">
                  1) Compliance of SOP
                </label>
                <div className="container col-12">
                  <div className="mt-3">
                    <button
                      className={`btn me-2 ${
                        answers.complianceSOP === "Poor" ? "btn-danger" : ""
                      }`}
                      onClick={() => handleButtonClick("complianceSOP", "Poor")}
                    >
                      Poor
                    </button>
                    <button
                      className={`btn me-2 ${
                        answers.complianceSOP === "Good" ? "btn-warning" : ""
                      }`}
                      onClick={() => handleButtonClick("complianceSOP", "Good")}
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
                        handleButtonClick("complianceSOP", "Excellent")
                      }
                    >
                      Excellent
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group-row therating">
                <label className="col-6 starlabel" htmlFor="activeListening">
                  2) Active Listening & Proper response
                </label>
                <div className="container col-12">
                  <div className="mt-3">
                    <button
                      className={`btn me-2 ${
                        answers.activeListening === "Poor" ? "btn-danger" : ""
                      }`}
                      onClick={() =>
                        handleButtonClick("activeListening", "Poor")
                      }
                    >
                      Poor
                    </button>
                    <button
                      className={`btn me-2 ${
                        answers.activeListening === "Good" ? "btn-warning" : ""
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
                        handleButtonClick("activeListening", "Excellent")
                      }
                    >
                      Excellent
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group-row therating ">
                <label className="col-6 starlabel" htmlFor="correctDetails">
                  3) Correct And Relevant Details Capturing
                </label>
                <div className="container col-12">
                  <div className="mt-3">
                    <button
                      className={`btn me-2 ${
                        answers.correctDetails === "Poor" ? "btn-danger" : ""
                      }`}
                      onClick={() =>
                        handleButtonClick("correctDetails", "Poor")
                      }
                    >
                      Poor
                    </button>
                    <button
                      className={`btn me-2 ${
                        answers.correctDetails === "Good" ? "btn-warning" : ""
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
                        handleButtonClick("correctDetails", "Excellent")
                      }
                    >
                      Excellent
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group-row therating">
                <label className="col-6 starlabel" htmlFor="addressTagging">
                  4) Correct Address Tagging
                </label>
                <div className="container col-12">
                  <div className="mt-3">
                    <button
                      className={`btn me-2 ${
                        answers.addressTagging === "Poor" ? "btn-danger" : ""
                      }`}
                      onClick={() =>
                        handleButtonClick("addressTagging", "Poor")
                      }
                    >
                      Poor
                    </button>
                    <button
                      className={`btn me-2 ${
                        answers.addressTagging === "Good" ? "btn-warning" : ""
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
                        handleButtonClick("addressTagging", "Excellent")
                      }
                    >
                      Excellent
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group-row therating">
                <label className="col-6 starlabel" htmlFor="callHandlingTime">
                  5) Call handled Time
                </label>
                <div className="container col-12">
                  <div className="mt-3">
                    <button
                      className={`btn me-2 ${
                        answers.callHandlingTime === "Poor" ? "btn-danger" : ""
                      }`}
                      onClick={() =>
                        handleButtonClick("callHandlingTime", "Poor")
                      }
                    >
                      Poor
                    </button>
                    <button
                      className={`btn me-2 ${
                        answers.callHandlingTime === "Good" ? "btn-warning" : ""
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
                        handleButtonClick("callHandlingTime", "Excellent")
                      }
                    >
                      Excellent
                    </button>
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
    </>
  );
}
