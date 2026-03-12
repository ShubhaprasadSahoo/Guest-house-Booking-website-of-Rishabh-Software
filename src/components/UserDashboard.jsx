import React, { useEffect, useState } from "react";
import API from "../api";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function GuestCard({ house, onBook }) {
  return (
    <div className="card shadow-sm" style={{ width: 280, borderRadius: 12 }}>
      <img
        src={house.imageUrl || "https://via.placeholder.com/280x160"}
        className="card-img-top"
        style={{
          height: 160,
          objectFit: "cover",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
        alt=""
      />
      <div className="card-body">
        <h5 className="card-title text-center">{house.name}</h5>
        <p className="text-muted text-center">
          <i className="bi bi-geo-alt"></i> {house.location}
        </p>
        <p className="card-text" style={{ minHeight: 40 }}>
          {house.description || "No description available."}
        </p>
        <div className="d-grid">
          <button className="btn btn-primary" onClick={() => onBook(house)}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [houses, setHouses] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    roomId: "",
    bedId: "",
    numberOfGuests: 1,
    roomType: "",
  });

  const [message, setMessage] = useState("");

  // Load guest houses
  useEffect(() => {
    API.get("/guesthouses")
      .then((r) => setHouses(r.data))
      .catch(() => {});
  }, []);

  // Open booking modal
  const openBookingFor = (house) => {
    setSelectedHouse(house);
    setRooms(house.rooms || []);
    setBeds([]);
    setForm((prev) => ({
      ...prev,
      roomId: "",
      bedId: "",
      numberOfGuests: 1,
      roomType: "",
    }));
    setShowBooking(true);
  };

  // When room changes → load beds + set roomType
  useEffect(() => {
    if (!form.roomId) {
      setBeds([]);
      setForm((p) => ({ ...p, bedId: "" }));
      return;
    }

    const room = rooms.find((r) => r._id === form.roomId);

    setBeds(room?.beds || []);

    // AUTO-SET ROOM TYPE (IMPORTANT FIX)
    setForm((prev) => ({
      ...prev,
      roomType: room?.type || "Standard",
    }));
  }, [form.roomId, rooms]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit booking
  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        guestName: form.guestName,
        email: form.email,
        phone: form.phone,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numberOfGuests: Number(form.numberOfGuests),
        roomType: form.roomType || "Standard", // FIXED
        guestHouse: selectedHouse._id, // REQUIRED
        roomId: form.roomId,
        bedId: form.bedId || undefined,
      };

      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Booking created successfully!");
      setShowBooking(false);
    } catch (err) {
      setMessage("Booking failed.");
      console.error(err.response?.data || err);
    }
  };

  // Verify user login
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
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="d-flex">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="container-fluid p-0" style={{ backgroundColor: "#f8f9fa" }}>
        <Navbar user={user} />
        <h2 className="text-center mb-4">Featured Guest Houses</h2>

        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {houses.map((h) => (
            <GuestCard key={h._id} house={h} onBook={openBookingFor} />
          ))}
        </div>

        {/* BOOKING MODAL */}
        <Modal show={showBooking} onHide={() => setShowBooking(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book — {selectedHouse?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {message && <div className="alert alert-info">{message}</div>}

            <Form onSubmit={submitBooking}>
              <Form.Group className="mb-2">
                <Form.Label>Guest Name</Form.Label>
                <Form.Control
                  name="guestName"
                  value={form.guestName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="row">
                <div className="col">
                  <Form.Group className="mb-2">
                    <Form.Label>Check-in</Form.Label>
                    <Form.Control
                      name="checkInDate"
                      type="date"
                      value={form.checkInDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </div>

                <div className="col">
                  <Form.Group className="mb-2">
                    <Form.Label>Check-out</Form.Label>
                    <Form.Control
                      name="checkOutDate"
                      type="date"
                      value={form.checkOutDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-2">
                <Form.Label>Room</Form.Label>
                <Form.Select
                  name="roomId"
                  value={form.roomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} — {r.type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Bed (optional)</Form.Label>
                <Form.Select
                  name="bedId"
                  value={form.bedId}
                  onChange={handleChange}
                >
                  <option value="">Choose bed (optional)</option>
                  {beds.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Number of Guests</Form.Label>
                <Form.Control
                  name="numberOfGuests"
                  type="number"
                  value={form.numberOfGuests}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="text-end">
                <Button variant="secondary" onClick={() => setShowBooking(false)} className="me-2">
                  Cancel
                </Button>
                <Button type="submit">Book</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
