import React, { useState, Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Components/Login/Login";

// Lazy loading components
const Calldata = lazy(() => import("./Components/Pages/Calldata"));
const Performancereport = lazy(() => import("./Components/Pages/Performancereport"));
const Detailedreport = lazy(() => import("./Components/Pages/Detailedreport"));
const Adminsetting = lazy(() => import("./Components/Pages/Adminsetting"));
const Dashboard = lazy(() => import("./Components/Pages/Dashboard"));
const Navbar = lazy(() => import("./Components/Pages/Navbar"));
const Sidebar = lazy(() => import("./Components/Pages/Sidebar"));
const Error = lazy(() => import("./Components/Pages/Error"));

// Lazy loading FontAwesomeIcon and faSpinner
const LazyFontAwesomeIcon = lazy(() =>
  import("@fortawesome/react-fontawesome").then((module) => ({
    default: module.FontAwesomeIcon,
  }))
);
const LazyFaSpinner = lazy(() =>
  import("@fortawesome/free-solid-svg-icons").then((module) => ({
    default: module.faSpinner,
  }))
);

const Loader = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
    <Suspense fallback={<div>Loading icon...</div>}>
      <LazyFontAwesomeIcon icon={LazyFaSpinner} spin size="3x" />
    </Suspense>
    <div className="mt-3">Loading...</div>
  </div>
);

const MainLayout = ({ isSidebarOpen, toggleSidebar, logout, role }) => {
  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} logout={logout} />
      <Navbar toggleSidebar={toggleSidebar} logout={logout} />
      <section
        className={`main_content dashboard_part large_header_bg ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
       <Routes>
          {role === "admin" && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calldata" element={<Calldata />} />
            </>
          )}
          {role === "SCO" && (
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const login = () => {
    setIsAuthenticated(true);
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  };

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
  };

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
              !isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/dashboard" />
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
