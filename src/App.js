import React, { useState, Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Components/Login/Login";
import Swal from "sweetalert2";

// Lazy loading components
const Calldata = lazy(() => import("./Components/Pages/Calldata"));
const Performancereport = lazy(() => import("./Components/Pages/Performancereport"));
const Detailedreport = lazy(() => import("./Components/Pages/Detailedreport"));
const Adminsetting = lazy(() => import("./Components/Pages/Adminsetting"));
const Dashboard = lazy(() => import("./Components/Pages/Dashboard"));
const Navbar = lazy(() => import("./Components/Pages/Navbar"));
const Sidebar = lazy(() => import("./Components/Pages/Sidebar"));
const Error = lazy(() => import("./Components/Pages/Error"));

// Loader component
const Loader = () => (
  <div
    className="d-flex flex-column align-items-center justify-content-center"
    style={{ height: "100vh" }}
  >
    <div className="spinner-border" role="status">
      <span className="sr-only">Loading...</span>
    </div>
    <div className="mt-3">Loading...</div>
  </div>
);

const MainLayout = ({ isSidebarOpen, toggleSidebar, logout, role }) => {
  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} logout={logout} />
      <Navbar toggleSidebar={toggleSidebar} logout={logout} />
      <section className={`main_content dashboard_part large_header_bg ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Routes>
          {role === "SCO" && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calldata" element={<Calldata />} />
            </>
          )}
          {role === "admin" && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calldata" element={<Calldata />} />
              <Route path="/performancereport" element={<Performancereport />} />
              <Route path="/detailedreport/:loginId" element={<Detailedreport />} />
              <Route path="/adminsetting" element={<Adminsetting />} />
            </>
          )}
          <Route path="*" element={<Error />} />
        </Routes>
      </section>
    </>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false); // Prevent multiple alerts

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const login = () => {
    setIsAuthenticated(true);
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    resetLogoutTimer(); // Start the logout timer on login
  };

  const logout = () => {
    proceedToLogout();
  };

  const proceedToLogout = () => {
    // Remove user data from local storage
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Update authentication state
    setIsAuthenticated(false);
    setRole(null);

    // After cleaning up, navigate to the login page
    window.location.href = "/";
  };

  const resetLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    // Clear any existing timeout before setting a new one
    clearTimeout(logoutTimer);

    setLogoutTimer(
      setTimeout(() => {
        if (isAuthenticated && !isLogoutAlertVisible) {
          setIsLogoutAlertVisible(true); // Show the alert once

          // Show SweetAlert2 with a delay for logout
          Swal.fire({
            text: "You have been idle for 10 minutes! You will be logged out automatically.",
            icon: 'warning',
            confirmButtonText: 'OK',
            timer: 5000, // Set timer for 5 seconds
            timerProgressBar: true, // Show a progress bar for the timer
          }).then((result) => {
            setIsLogoutAlertVisible(false); // Reset the alert visibility
            if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
              proceedToLogout(); // Proceed to logout after 5 seconds or on confirm
            }
          });
        }
      }, 100 * 60 * 1000) // 10 minutes for inactivity detection
    );
  };

  // Reset the logout timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      resetLogoutTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Clean up the event listeners on unmount
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [isAuthenticated]); // Only reset timer when authenticated

  // Check if the user is authenticated on app load
  useEffect(() => {
    const username = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (username) {
      setIsAuthenticated(true);
      setRole(storedRole);
    }
  }, []);

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login onLogin={login} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  logout={logout}
                  role={role}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
