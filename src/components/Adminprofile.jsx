import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

import MainPage from "./MainPage";

export default function Adminprofile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error loading profile", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <MainPage/>

      <div className="flex-grow-1">
        {/* Navbar */}
        <Navbar user={user} />

        <div className="container mt-4 col-md-6">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">My Profile</h3>

            <div className="mb-3">
              <label className="form-label fw-bold">Name</label>
              <input type="text" className="form-control" value={user.name} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" className="form-control" value={user.email} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <input type="text" className="form-control" value={user.role} disabled />
            </div>

            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={() => window.location.href='/edit-adminprofile'}>
                Edit Profile
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
