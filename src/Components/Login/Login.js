import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import "./bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import CryptoJS from "crypto-js";

const generateCaptcha = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

const CaptchaImage = ({ captcha }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(captcha, canvas.width / 2, canvas.height / 2);
  }, [captcha]);
  
  return <canvas ref={canvasRef} width="200" height="50"></canvas>;
};

const Login = ({ onLogin }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [formData, setFormData] = useState({ username: "", password: "", captchaInput: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const { data } = await axios.get("https://your-api-endpoint.com/credentials");
        setFormData(prev => ({ ...prev, username: data.username, password: data.password }));
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };
    fetchCredentials();
  }, []);
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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
      return setFormData(prev => ({ ...prev, captchaInput: "" }));
    }

    try {
      if (username === "rohit" && password === "Rohit@123") {
        localStorage.setItem("username", username);
        localStorage.setItem("role", "admin");
        onLogin(); // Call the login function passed from App component
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
    setFormData(prev => ({ ...prev, captchaInput: "" }));
  };

  return (
    <div className="d-md-flex half">
      <div className="contents">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-12">
              <div className="form-block mx-auto">
                <div className="text-center mb-5">
                  <img src="112_hr_logo.png" alt="Logo" className="logo-img" />
                  <h3 className="login-title">
                    
                      <strong>Quality Assurance Login System</strong>
                    
                  </h3>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-group first">
                    <label htmlFor="username">Username <span className="text-danger"> *</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group last mb-3">
                    <label htmlFor="password">Password<span className="text-danger"> *</span></label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group captcha-group">
                    <div className="captcha-container">
                      <CaptchaImage captcha={captcha} />
                      <button type="button" onClick={handleCaptchaRefresh}>
                        <FontAwesomeIcon icon={faSyncAlt} size="2x" />
                      </button>
                    </div>
                    <input type="text"
                      className="form-control"
                      placeholder="Enter CAPTCHA"
                      id="captchaInput"
                      value={formData.captchaInput}
                      onChange={handleChange}
                      required
                    />
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
