import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  //   try {
  //     const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
  //     localStorage.setItem("token", res.data.token);
  //     alert("Login successful");
  //     navigate("/dashboard");
  //   } catch (err) {
  //     alert(err.response.data.msg);
  //   }
    
try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);

    alert("Login successful");

    if (res.data.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  } catch (err) {
    alert(err.response?.data?.msg || "Login failed");
  }
   };

  return (
    <div className="container mt-5 col-md-4">
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input type="email" className="form-control mb-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary w-100">Login</button>
      </form>
      <div className="mt-3">
        <Link to="/forgot-password">Forgot Password?</Link> | 
        <Link to="/register" className="ms-2">Create Account</Link>
      </div>
    </div>
  );
}

/*const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);

    alert("Login successful");

    if (res.data.role === "admin") {
      navigate("/admin-dashboard");   // Admin Panel
    } else {
      navigate("/user-dashboard");    // User Panel
    }
  } catch (err) {
    alert(err.response?.data?.msg || "Login failed");
  }
};*/

