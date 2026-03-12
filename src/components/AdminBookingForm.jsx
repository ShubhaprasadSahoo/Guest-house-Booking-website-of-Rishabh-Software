import React, { useState, useEffect } from "react";
import axios from "axios";
import MainPage from "./MainPage";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const AdminBookingForm = () => {
  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    roomType: "",
    numberOfGuests: 1,
    guestHouse: "", // guest house id
    roomId: "",     // selected room id
    bedId: ""       // selected bed id
  });

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [guestHouses, setGuestHouses] = useState([]);
  const [roomsForHouse, setRoomsForHouse] = useState([]);
  const [bedsForRoom, setBedsForRoom] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    axios.get("http://localhost:5000/api/auth/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data.user))
      .catch((err) => { console.error(err.response?.data || err); localStorage.removeItem("token"); navigate("/"); });

    // load guest houses
    axios.get("http://localhost:5000/api/guesthouses")
      .then(res => setGuestHouses(res.data))
      .catch(err => console.error("Failed to load guest houses", err));
  }, [navigate]);

  // when guestHouse changes -> populate rooms
  useEffect(() => {
    if (!formData.guestHouse) { setRoomsForHouse([]); setBedsForRoom([]); setFormData(prev=>({...prev, roomId:"", bedId:""})); return; }
    const house = guestHouses.find(h => h._id === formData.guestHouse);
    if (!house) { setRoomsForHouse([]); return; }
    setRoomsForHouse(house.rooms || []);
    setFormData(prev => ({ ...prev, roomType: "", roomId: "", bedId: "" }));
    setBedsForRoom([]);
  }, [formData.guestHouse, guestHouses]);

  // when room changes -> populate beds
  useEffect(() => {
    if (!formData.roomId) { setBedsForRoom([]); setFormData(prev=>({...prev, bedId:""})); return; }
    const room = roomsForHouse.find(r => r._id === formData.roomId);
    setBedsForRoom(room?.beds || []);
    setFormData(prev => ({ ...prev, roomType: room?.type || prev.roomType }));
  }, [formData.roomId, roomsForHouse]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const payload = {
        guestName: formData.guestName,
        email: formData.email,
        phone: formData.phone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        roomType: formData.roomType,
        numberOfGuests: Number(formData.numberOfGuests),
        guestHouse: formData.guestHouse,
        roomId: formData.roomId,
        bedId: formData.bedId || undefined
      };

      await axios.post("http://localhost:5000/api/bookings", payload, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Booking created successfully!");
      setFormData({
        guestName: "", email: "", phone: "", checkInDate: "", checkOutDate: "",
        roomType: "", numberOfGuests: 1, guestHouse: "", roomId: "", bedId: ""
      });
      setRoomsForHouse([]); setBedsForRoom([]);
    } catch (err) {
      setMessage("Failed to create booking.");
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="d-flex">
      <MainPage />
      <div className="container-fluid p-0" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Navbar user={user} />
        <div className="container mt-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Guest House Booking Form</h3>

            {message && <div className="alert alert-info text-center" role="alert">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Guest Name</label>
                  <input type="text" className="form-control" name="guestName" value={formData.guestName} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Check-In Date</label>
                  <input type="date" className="form-control" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Check-Out Date</label>
                  <input type="date" className="form-control" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Guest House</label>
                  <select className="form-select" name="guestHouse" value={formData.guestHouse} onChange={handleChange} required>
                    <option value="">Select Guest House</option>
                    {guestHouses.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Room</label>
                  <select className="form-select" name="roomId" value={formData.roomId} onChange={handleChange} required>
                    <option value="">Select Room</option>
                    {roomsForHouse.map(r => <option key={r._id} value={r._id}>{r.name} — {r.type}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Bed (optional)</label>
                  <select className="form-select" name="bedId" value={formData.bedId} onChange={handleChange}>
                    <option value="">Select Bed (optional)</option>
                    {bedsForRoom.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Number of Guests</label>
                  <input type="number" className="form-control" name="numberOfGuests" value={formData.numberOfGuests} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Room Type</label>
                  <input type="text" className="form-control" name="roomType" value={formData.roomType} onChange={handleChange} required />
                </div>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary w-50">Submit Booking</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingForm;
