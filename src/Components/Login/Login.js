import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import "./bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import userLogo from "./assets/112_hr_logo.png";

const generateCaptcha = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

const CaptchaImage = ({ captcha }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a professional sports-themed background pattern
    const drawCircles = () => {
      const numCircles = 30; // Increase the number of circles
      const maxRadius = 10; // Smaller radius for the circles

      for (let i = 0; i < numCircles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * maxRadius;

        // Use a subtle color for the circles
        const color = `rgba(0, 0, 0, 0.1)`; // Light grey for subtlety
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    };

    drawCircles();

    // Draw the captcha text
    ctx.font = "35px 'Arial', sans-serif"; // Use a normal font size and style
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // Apply a text outline and shadow for better readability
    ctx.strokeStyle = "#000"; // Outline color
    ctx.lineWidth = 1; // Outline width
    ctx.strokeText(captcha, canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "#000"; // Text color
    ctx.fillText(captcha, canvas.width / 2, canvas.height / 2);
  }, [captcha]);

  return <canvas ref={canvasRef} width="200" height="50"></canvas>;
};

const Login = ({ onLogin }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captchaInput: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef(null); // Reference for the WebSocket

  useEffect(() => {
    // Connect to WebSocket server on port 8080
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established"); // Log successful connection
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CONCURRENT_LOGIN') {
        alert(data.message); // Notify the user about the concurrent login
        handleLogout(); // Optionally log out the user
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error); // Log any WebSocket errors
    };

    return () => {
      socketRef.current.close(); // Clean up WebSocket on unmount
    };
  }, []);

  const handleLogout = () => {
    // Logic for logging out the user
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login"); // Redirect to login page
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCaptchaRefresh = () => {
    setCaptcha(generateCaptcha());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password, captchaInput } = formData;

    if (!username || !password) {
      return setErrorMessage("Please provide valid input");
    }

    if (captchaInput !== captcha) {
      setErrorMessage("Invalid Captcha!");
      handleCaptchaRefresh();
      return setFormData((prev) => ({ ...prev, captchaInput: "" }));
    }

    try {
      // Simulate login logic
      if ((username === "rohit" && password === "Rohit@123") || (username === "SCO" && password === "SCO1")) {
        localStorage.setItem("username", username);
        localStorage.setItem("role", username === "rohit" ? "admin" : "SCO");
        onLogin(); // Call the login function passed from App component

        // Notify WebSocket server of login
        socketRef.current.send(JSON.stringify({ type: 'LOGIN', username }));

        navigate("/dashboard");
      } else {
        setErrorMessage("Invalid user credentials.");
      }
      setErrorMessage("");
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid user credentials.");
    }
    handleCaptchaRefresh();
    setFormData((prev) => ({ ...prev, captchaInput: "" }));
  };

  return (
    <div className="d-md-flex half">
      <div className="contents">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-12">
              <div className="form-block mx-auto">
                <div className="text-center mb-5">
                  <img
                    src={userLogo}
                    alt="Logo"
                    className="logo-img mt-xl-n4"
                  />
                  <h3 className="login-title">
                    <strong>Quality Assurance Login System</strong>
                  </h3>
                  <label
                    style={{
                      color: "#5d7c99",
                      fontSize: "20px",
                      fontWeight: "600",
                    }}
                  >
                    Welcome Back...
                  </label>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="placeholder-container form-group first">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    <span className="required-asterisk">*</span>
                  </div>
                  <div className="placeholder-container form-group last mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <span className="required-asterisk">*</span>
                  </div>
                  <div className="placeholder-container form-group captcha-group">
                    <div className="captcha-container">
                      <CaptchaImage captcha={captcha} className="w-25 ml-2" />
                      <span onClick={handleCaptchaRefresh}>
                        <FontAwesomeIcon
                          icon={faSyncAlt}
                          size="2x"
                          className="captcha-refresh"
                        />
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter CAPTCHA"
                      id="captchaInput"
                      value={formData.captchaInput}
                      onChange={handleChange}
                      required
                    />
                    <span className="required-asterisk">*</span>
                  </div>
                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                  <input
                    type="submit"
                    value="Log In"
                    className="btn btn-block btn-primary"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;