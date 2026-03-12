import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/register", form);
    alert("User registered successfully");
    navigate("/");
  };

  return (
    <div className="container mt-5 col-md-4">
      <h3>Register</h3>
      <form onSubmit={handleRegister}>
        <input type="text" className="form-control mb-2" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" className="form-control mb-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="form-control mb-2" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-success w-100">Register</button>
      </form>
      <div className="mt-3">
        <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
}
