import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import MainPage from "./MainPage";
import { useNavigate } from "react-router-dom";

const AdminBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  // ✅ Verify token & fetch bookings
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("http://localhost:5000/api/auth/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/");
      });

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      setFilteredBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!reason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReason("");
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 Filter logic
  useEffect(() => {
    let filtered = [...bookings];

    // Search by name or email
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(
        (b) => b.checkInDate.slice(0, 10) === dateFilter
      );
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, dateFilter, bookings]);

  return (
    <div className="d-flex">
      <MainPage />
      <div
        className="container-fluid p-0"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <Navbar user={user} />

        <div className="container mt-4">
          <h3 className="mb-4 text-center fw-bold">Booking Requests</h3>

          {/* ✅ Search and Filter Controls */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="form-select w-25"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <input
              type="date"
              className="form-control w-25"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDateFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* ✅ Bookings Table */}
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
              <th>Guest House</th>
              <th>Room</th>
              <th>Bed</th>
              <th>Guest Name</th>
                  <th>Email</th>
                  <th>Room Type</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                     <td>{booking.guestHouse?.name || "N/A"}</td>
                     <td>{booking.roomName}</td>
                       <td>{booking.bedName}</td> 


                      <td>{booking.guestName}</td>
                      <td>{booking.email}</td>
                      <td>{booking.roomType}</td>
                      <td>{booking.checkInDate?.slice(0, 10)}</td>
                      <td>{booking.checkOutDate?.slice(0, 10)}</td>
                      <td>
                        <span
                          className={`badge ${
                            booking.status === "Approved"
                              ? "bg-success"
                              : booking.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === "Pending" ? (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleApprove(booking._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setSelectedBooking(booking._id)}
                            >
                              Reject
                            </button>

                            {selectedBooking === booking._id && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  placeholder="Enter reason"
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                />
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleReject(booking._id)}
                                >
                                  Confirm Reject
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">No action</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingList;
