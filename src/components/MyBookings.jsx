

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";    // ✅ Added Sidebar
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    // ✅ fetch logged-in user
    axios
      .get("http://localhost:5000/api/auth/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });

    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  return (
    <div className="d-flex">
      
      {/* ✅ Sidebar on the left */}
      <Sidebar />

      {/* ✅ Right section: full page content */}
      <div className="container-fluid p-0" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>

        {/* ✅ Navbar at the top */}
        <Navbar user={user} />

        {/* Page content */}
        <div className="container mt-4">
          <div className="card shadow p-4" style={{ borderRadius: "12px" }}>
            <h4 className="fw-bold mb-4 text-center">My Bookings</h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Guest House</th>
                    <th>Room</th>
                    <th>Bed</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b._id}>
                        <td>{b.guestHouse?.name || "N/A"}</td>
                        <td>{b.roomName}</td>
                        <td>{b.bedName}</td>
                        <td>{b.checkInDate?.slice(0, 10)}</td>
                        <td>{b.checkOutDate?.slice(0, 10)}</td>

                        <td>
                          <span
                            className={`badge px-3 py-2 ${
                              b.status === "Approved"
                                ? "bg-success"
                                : b.status === "Rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
