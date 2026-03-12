// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import MainPage from "./MainPage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

const [stats, setStats] = useState({
  totalBookings: 0,
  approved: 0,
  rejected: 0,
  pending: 0,
  todaysBookings: 0,
  guestHouses: 0,
  occupancyRate: 0
});

// ✅ Verify token when Dashboard loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // redirect to login if no token
      return;
    }

    // Call protected backend route
    axios
      .get("http://localhost:5000/api/auth/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        localStorage.removeItem("token");
        navigate("/"); // redirect if token invalid
      });
  }, [navigate]);


  useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get("http://localhost:5000/api/bookings/dashboard-stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setStats(res.data))
    .catch((err) => console.error(err));
}, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="d-flex">
      <MainPage />
      <div
        className="container-fluid p-0"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        {/* ✅ Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 mb-4">
          <span className="navbar-brand fw-bold fs-4">
            Rishabh Guest House
          </span>
          <div className="ms-auto d-flex align-items-center">
            <h5 className="mb-0 me-3 text-secondary">
              Welcome {user ? user.name : "Loading..."}
            </h5>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* ✅ Dashboard Content */}
        <div className="container-fluid px-4 pb-4">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Total Bookings</h5>
                  <h3>{stats.totalBookings}</h3>
                  </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Approved Bookings</h5>
                  <h3>{stats.approved}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Reject Bookings</h5>
                  <h3>{stats.rejected}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Pending Booking</h5>
                  <h3>{stats.pending}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Occupacy Rate</h5>
                  <h3>{stats.occupancyRate}%</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Today's Booking</h5>
                  <h3>{stats.todaysBookings}</h3>
                </div>
              </div>
            </div>
          <div className="col-md-3 mb-3">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Guest Houses</h5>
                  <h3>{stats.guestHouses}</h3>
                </div>
              </div>
            </div>
          </div>
            
          

          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
