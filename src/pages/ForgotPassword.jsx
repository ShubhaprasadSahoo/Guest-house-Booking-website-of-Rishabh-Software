import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
    alert("Password reset link sent to your email");
  };

  return (
    <div className="container mt-5 col-md-4">
      <h3>Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <input type="email" className="form-control mb-2" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-warning w-100">Send Reset Link</button>
      </form>
    </div>
  );
}
