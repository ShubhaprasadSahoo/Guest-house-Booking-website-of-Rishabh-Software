import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import Navbar from "./Navbar";
import MainPage from "./MainPage";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Modal,
  Button,
  Form,
  Table,
  Badge,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";

const EMPTY_HOUSE = { name: "", location: "", description: "", imageUrl: "" };
const EMPTY_ROOM = { name: "", type: "", price: "", totalBeds: 1, amenities: "" };
const EMPTY_AVAILABILITY = { startDate: "", endDate: "" };

function AdminGuestHousePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [showHouseModal, setShowHouseModal] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [houseForm, setHouseForm] = useState(EMPTY_HOUSE);


  const [roomsModalOpen, setRoomsModalOpen] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState(null);
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM);
  const [newBedName, setNewBedName] = useState("");

  const [availabilityForm, setAvailabilityForm] = useState(EMPTY_AVAILABILITY);
  const [availabilityResult, setAvailabilityResult] = useState([]);


  const [roomActionLoading, setRoomActionLoading] = useState(false);
  const [bedActionLoading, setBedActionLoading] = useState(false);

  const selectedHouse = useMemo(
    () => houses.find((h) => h._id === selectedHouseId) || null,
    [houses, selectedHouseId]
  );

  // 🔐 Verify token and load logged-in user
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
  }, [navigate]);

  useEffect(() => {
    loadHouses();
  }, []);

  const withNotification = (fn) => async (...args) => {
    try {
      await fn(...args);
      setFeedback({ type: "success", message: "Changes saved successfully." });
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Request failed.";
      setFeedback({ type: "danger", message });
      throw error;
    }
  };

  const loadHouses = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/guesthouses");
      setHouses(data);
    } catch (error) {
      setFeedback({
        type: "danger",
        message: error.response?.data?.message || "Unable to load guest houses.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateHouseModal = () => {
    setEditingHouseId(null);
    setHouseForm(EMPTY_HOUSE);
    setShowHouseModal(true);
  };

  const openEditHouseModal = (house) => {
    setEditingHouseId(house._id);
    setHouseForm({
      name: house.name || "",
      location: house.location || "",
      description: house.description || "",
      imageUrl: house.imageUrl || "",
    });
    setShowHouseModal(true);
  };

  const saveHouse = withNotification(async () => {
    const payload = {
      ...houseForm,
      imageUrl: houseForm.imageUrl?.trim() || "",
      description: houseForm.description?.trim() || "",
    };

    if (editingHouseId) {
      await API.put(`/guesthouses/${editingHouseId}`, payload);
    } else {
      await API.post("/guesthouses", payload);
    }

    setShowHouseModal(false);
    setHouseForm(EMPTY_HOUSE);
    await loadHouses();
  });

  const deleteHouse = withNotification(async (id) => {
    if (!window.confirm("Delete this guest house and all its rooms?")) return;

    await API.delete(`/guesthouses/${id}`);

    if (selectedHouseId === id) {
      setRoomsModalOpen(false);
      setSelectedHouseId(null);
    }

    await loadHouses();
  });

  const openRoomsModal = (houseId) => {
    setSelectedHouseId(houseId);
    setRoomForm(EMPTY_ROOM);
    setNewBedName("");
    setAvailabilityForm(EMPTY_AVAILABILITY);
    setAvailabilityResult([]);
    setRoomsModalOpen(true);
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "totalBeds" ? value.replace(/\D/g, "") : value,
    }));
  };

  const refreshSelectedHouse = (updatedHouses) => {
    setHouses(updatedHouses);
    const next = updatedHouses.find((h) => h._id === selectedHouseId);
    if (!next) {
      setRoomsModalOpen(false);
      setSelectedHouseId(null);
    }
  };

  const addRoom = withNotification(async () => {
    if (!selectedHouse) return;
    if (!roomForm.name.trim() || !roomForm.type.trim())
      throw new Error("Room name and type are required.");

    setRoomActionLoading(true);
    try {
      const payload = {
        name: roomForm.name.trim(),
        type: roomForm.type.trim(),
        price: Number(roomForm.price) || 0,
        totalBeds: Number(roomForm.totalBeds) || 1,
        amenities: roomForm.amenities.split(",").map((i) => i.trim()).filter(Boolean),
      };

      await API.post(`/guesthouses/${selectedHouse._id}/rooms`, payload);

      const { data } = await API.get("/guesthouses");
      refreshSelectedHouse(data);

      setRoomForm(EMPTY_ROOM);
    } finally {
      setRoomActionLoading(false);
    }
  });

  const removeRoom = withNotification(async (roomId) => {
    if (!selectedHouse || !roomId) return;
    if (!window.confirm("Delete this room?")) return;

    setRoomActionLoading(true);
    try {
      await API.delete(`/guesthouses/${selectedHouse._id}/rooms/${roomId}`);

      const { data } = await API.get("/guesthouses");
      refreshSelectedHouse(data);
    } finally {
      setRoomActionLoading(false);
    }
  });

  // ------------ BED OPERATIONS ----------------------------------

  const addBed = withNotification(async (roomId, name) => {
    if (!name.trim()) throw new Error("Enter bed name.");

    setBedActionLoading(true);
    try {
      await API.post(`/guesthouses/${selectedHouse._id}/rooms/${roomId}/beds`, {
        name: name.trim(),
      });

      const { data } = await API.get("/guesthouses");
      refreshSelectedHouse(data);
      setNewBedName("");
    } finally {
      setBedActionLoading(false);
    }
  });

  const removeBed = withNotification(async (roomId, bedId) => {
    if (!window.confirm("Delete this bed?")) return;

    setBedActionLoading(true);
    try {
      await API.delete(
        `/guesthouses/${selectedHouse._id}/rooms/${roomId}/beds/${bedId}`
      );

      const { data } = await API.get("/guesthouses");
      refreshSelectedHouse(data);
    } finally {
      setBedActionLoading(false);
    }
  });

  // ------------ AVAILABILITY ----------------------------------

  const checkAvailability = withNotification(async () => {
    if (!availabilityForm.startDate || !availabilityForm.endDate) {
      throw new Error("Select start & end date.");
    }

    const { data } = await API.get(
      `/guesthouses/${selectedHouse._id}/availability`,
      { params: availabilityForm }
    );

    setAvailabilityResult(data.rooms || []);
  });

  return (
    <div className="d-flex">
      {/* LEFT SIDEBAR */}
      <MainPage />

      {/* MAIN CONTENT AREA */}
      <div className="container-fluid p-0" style={{ background: "#f8f9fa" }}>
        <Navbar user={user}/>

        <div className="container mt-3">
          <h3 className="fw-bold mb-3 text-center">Guest House Management</h3>

          {feedback && (
            <Alert
              variant={feedback.type}
              onClose={() => setFeedback(null)}
              dismissible
            >
              {feedback.message}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading guest houses...</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={openCreateHouseModal}>
                  + Add Guest House
                </Button>
              </div>

              {/* Guest House Table */}
              <Table bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th width="250px">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((house) => (
                    <tr key={house._id}>
                      <td>{house._id.slice(-6)}</td>
                      <td>{house.name}</td>
                      <td>{house.location || "-"}</td>
                      <td className="text-truncate" style={{ maxWidth: 240 }}>
                        {house.description || "—"}
                      </td>
                      <td>
                        <Badge bg={house.status === "active" ? "success" : "secondary"}>
                          {house.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => openEditHouseModal(house)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="info"
                          className="me-2 text-white"
                          onClick={() => openRoomsModal(house._id)}
                        >
                          Rooms
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteHouse(house._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {/* House Modal */}
          <Modal
            show={showHouseModal}
            onHide={() => setShowHouseModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {editingHouseId ? "Edit Guest House" : "Add Guest House"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={houseForm.name}
                    onChange={(e) =>
                      setHouseForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    value={houseForm.location}
                    onChange={(e) =>
                      setHouseForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    value={houseForm.imageUrl}
                    onChange={(e) =>
                      setHouseForm((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={houseForm.description}
                    onChange={(e) =>
                      setHouseForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowHouseModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveHouse}>
                {editingHouseId ? "Save Changes" : "Create"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Rooms Modal */}
          <Modal
            show={roomsModalOpen && !!selectedHouse}
            onHide={() => {
              setRoomsModalOpen(false);
              setSelectedHouseId(null);
            }}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Room Management — {selectedHouse?.name || "Guest House"}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {!selectedHouse ? (
                <p className="text-muted">Select a guest house to continue.</p>
              ) : (
                <>
                  {/* Add Room */}
                  <div className="border rounded p-3 mb-4">
                    <h6 className="mb-3">Add a Room</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <Form.Control
                          placeholder="Room name"
                          name="name"
                          value={roomForm.name}
                          onChange={handleRoomFormChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <Form.Control
                          placeholder="Room type"
                          name="type"
                          value={roomForm.type}
                          onChange={handleRoomFormChange}
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Control
                          placeholder="Price"
                          name="price"
                          value={roomForm.price}
                          onChange={handleRoomFormChange}
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Control
                          placeholder="Beds"
                          name="totalBeds"
                          value={roomForm.totalBeds}
                          onChange={handleRoomFormChange}
                        />
                      </div>
                      <div className="col-md-12">
                        <Form.Control
                          placeholder="Amenities (comma separated)"
                          name="amenities"
                          value={roomForm.amenities}
                          onChange={handleRoomFormChange}
                        />
                      </div>
                      <div className="col-md-12 d-flex justify-content-end">
                        <Button onClick={addRoom} disabled={roomActionLoading}>
                          {roomActionLoading ? "Saving…" : "Add Room"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Rooms */}
                  <div className="mb-4">
                    <h6>Existing Rooms</h6>

                    {selectedHouse.rooms?.length ? (
                      <Table responsive size="sm" bordered>
                        <thead className="table-dark">
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Beds</th>
                            <th>Amenities</th>
                            <th width="180px">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedHouse.rooms.map((room) => (
                            <tr key={room._id}>
                              <td>{room.name}</td>
                              <td>{room.type}</td>
                              <td>₹ {room.price}</td>
                              <td>{room.totalBeds}</td>
                              <td>{room.amenities?.join(", ") || "—"}</td>

                              <td>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => removeRoom(room._id)}
                                  disabled={roomActionLoading}
                                >
                                  Delete
                                </Button>

                                {/* BED SECTION */}
                                <div className="mt-2">
                                  <strong>Beds:</strong>

                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    {room.beds?.length ? (
                                      room.beds.map((b) => (
                                        <div
                                          key={b._id}
                                          className="border rounded px-2 py-1 d-flex align-items-center"
                                        >
                                          <small>{b.name}</small>
                                          <button
                                            className="btn btn-sm btn-link text-danger ms-2 p-0"
                                            onClick={() =>
                                              removeBed(room._id, b._id)
                                            }
                                            disabled={bedActionLoading}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-muted small">
                                        No beds
                                      </span>
                                    )}
                                  </div>

                                  <InputGroup className="mt-2">
                                    <Form.Control
                                      placeholder="New bed name (e.g. Bed 1)"
                                      value={newBedName}
                                      onChange={(e) =>
                                        setNewBedName(e.target.value)
                                      }
                                    />
                                    <Button
                                      onClick={() =>
                                        addBed(room._id, newBedName)
                                      }
                                      disabled={bedActionLoading}
                                    >
                                      Add
                                    </Button>
                                  </InputGroup>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className="text-muted">No rooms yet.</p>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="border rounded p-3">
                    <h6>Check Availability</h6>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={availabilityForm.startDate}
                          onChange={(e) =>
                            setAvailabilityForm((p) => ({
                              ...p,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-4">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={availabilityForm.endDate}
                          onChange={(e) =>
                            setAvailabilityForm((p) => ({
                              ...p,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-4 d-flex align-items-end">
                        <Button
                          variant="secondary"
                          className="w-100"
                          onClick={checkAvailability}
                        >
                          Check
                        </Button>
                      </div>
                    </div>

                    {availabilityResult.length > 0 && (
                      <div className="mt-3">
                        <Table size="sm" bordered>
                          <thead>
                            <tr>
                              <th>Room</th>
                              <th>Type</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {availabilityResult.map((room) => (
                              <tr key={room._id}>
                                <td>{room.name}</td>
                                <td>{room.type}</td>

                                <td>
                                  <Badge
                                    bg={room.available ? "success" : "danger"}
                                  >
                                    {room.available
                                      ? "Available"
                                      : "Booked"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default AdminGuestHousePage;

