import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function EditProfile() {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.user);
        setForm({
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile", error);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/auth/update-profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar user={user} />

        <div className="container mt-4 col-md-6">
          <div className="card shadow p-4">
            <h3 className="text-center mb-3">Edit Profile</h3>

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label fw-bold">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.role}
                  disabled
                />
              </div>

              <button className="btn btn-success w-100">Update Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
