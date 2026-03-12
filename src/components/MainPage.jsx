import React from 'react'
import { Link } from "react-router-dom";
const MainPage = () => {


  return (
    <>
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark vh-100" style={{ width: "250px" }}>
      <h4 className="text-center mb-4">Admin 360°</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/admin-dashboard" className="nav-link text-white active">
            Dashboard
          </Link>
        </li>
        <li><Link to="/booking" className="nav-link text-white">Guest House</Link></li>
        <li><Link to="/room" className="nav-link text-white">Room Management</Link></li>
        <li><Link to="/bed" className="nav-link text-white">Bed Management</Link></li>
        <li><Link to="/report" className="nav-link text-white">Booking Management</Link></li>
        <li><Link to="/audit" className="nav-link text-white">Audit Logs</Link></li>
        <li><Link to="/adminprofile" className="nav-link text-white">Profile</Link></li>
         </ul>
    </div>

    </>
  )
}

export default MainPage