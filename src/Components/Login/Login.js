import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import "./bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import userLogo from "./assets/112_hr_logo.png";

// Function to generate a random captcha
const generateCaptcha = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Possible characters for captcha
  // Create a 6-character random string
  return Array.from({ length: 6 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

// Component to render the captcha image
const CaptchaImage = ({ captcha }) => {
  const canvasRef = useRef(null); // Reference to the canvas element

  useEffect(() => {
    const canvas = canvasRef.current; // Get the canvas reference
    const ctx = canvas.getContext("2d"); // Get the 2D drawing context

    // Clear the canvas for redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a background pattern with circles
    const drawCircles = () => {
      const numCircles = 30; // Number of circles to draw
      const maxRadius = 10; // Maximum radius for the circles

      for (let i = 0; i < numCircles; i++) {
        const x = Math.random() * canvas.width; // Random x position
        const y = Math.random() * canvas.height; // Random y position
        const radius = Math.random() * maxRadius; // Random radius

        // Set a light grey color for subtle circles
        const color = `rgba(0, 0, 0, 0.1)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw the circle
        ctx.fillStyle = color; // Set fill color
        ctx.fill(); // Fill the circle
      }
    };

    drawCircles(); // Call the function to draw circles

    // Draw the captcha text
    ctx.font = "35px 'Arial', sans-serif"; // Set font style
    ctx.textBaseline = "middle"; // Set text baseline
    ctx.textAlign = "center"; // Center align the text

    // Draw the text outline and shadow for better visibility
    ctx.strokeStyle = "#000"; // Outline color
    ctx.lineWidth = 1; // Outline width
    ctx.strokeText(captcha, canvas.width / 2, canvas.height / 2); // Draw outline

    ctx.fillStyle = "#000"; // Text color
    ctx.fillText(captcha, canvas.width / 2, canvas.height / 2); // Draw filled text
  }, [captcha]); // Redraw on captcha change

  return <canvas ref={canvasRef} width="200" height="50"></canvas>; // Render the canvas
};

// Login component to handle user login
const Login = ({ onLogin }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha()); // State for captcha
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captchaInput: "",
  }); // State for form data
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate(); // Hook for navigation
  const socketRef = useRef(null); // Reference for the WebSocket

  useEffect(() => {
    // Connect to the WebSocket server on port 8080
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established"); // Log successful connection
    };

    // Handle messages from the WebSocket server
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "CONCURRENT_LOGIN") {
        alert(data.message); // Notify the user about concurrent login
        handleLogout(); // Log out the user if needed
      }
    };

    // Handle any WebSocket errors
    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error); // Log errors
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      socketRef.current.close();
    };
  }, []); // Run once on mount

  const handleLogout = () => {
    // Logic for logging out the user
    localStorage.removeItem("username"); // Remove username from local storage
    localStorage.removeItem("role"); // Remove role from local storage
    navigate("/login"); // Redirect to the login page
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    const { id, value } = e.target; // Get input id and value
    setFormData((prev) => ({ ...prev, [id]: value })); // Update form data state
  };

  // Refresh the captcha by generating a new one
  const handleCaptchaRefresh = () => {
    setCaptcha(generateCaptcha());
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    const { username, password, captchaInput } = formData; // Destructure form data

    // Validate input fields
    if (!username || !password) {
      return setErrorMessage("Please provide valid input");
    }

    // Validate the captcha input
    if (captchaInput !== captcha) {
      setErrorMessage("Invalid Captcha!"); // Show error message
      handleCaptchaRefresh(); // Refresh captcha
      return setFormData((prev) => ({ ...prev, captchaInput: "" })); // Reset captcha input
    }

    try {
      // Simulate login logic
      if (
        (username === "rohit" && password === "Rohit@123") ||
        (username === "SCO" && password === "SCO1") ||
        (username === "SCO2" && password === "SCO2") ||
        (username === "SCO3" && password === "SCO3")
      ) {
        localStorage.setItem("username", username); // Store username in local storage
        localStorage.setItem("role", username === "rohit" ? "admin" : "SCO"); // Store user role
        onLogin(); // Call the login function passed from parent component

        // Notify WebSocket server of login
        socketRef.current.send(JSON.stringify({ type: "LOGIN", username }));

        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setErrorMessage("Invalid user credentials."); // Show error message for invalid login
      }
      setErrorMessage(""); // Clear any error messages
    } catch (error) {
      console.error("Login failed:", error); // Log error
      setErrorMessage("Invalid user credentials."); // Show error message
    }
    handleCaptchaRefresh(); // Refresh captcha after submission
    setFormData((prev) => ({ ...prev, captchaInput: "" })); // Clear captcha input
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
