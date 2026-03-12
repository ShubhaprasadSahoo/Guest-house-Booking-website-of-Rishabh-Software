import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
    alert("Password reset successfully");
  };

  return (
    <div className="container mt-5 col-md-4">
      <h3>Reset Password</h3>
      <form onSubmit={handleSubmit}>
        <input type="password" className="form-control mb-2" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-success w-100">Reset Password</button>
      </form>
    </div>
  );
}
