import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 mb-4">
      <span className="navbar-brand fw-bold fs-4">
        Rishabh Guest House
      </span>
      <div className="ms-auto d-flex align-items-center">
        <h5 className="mb-0 me-3 text-secondary">
          Welcome {user ? user.name : "Loading..."}
        </h5>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
