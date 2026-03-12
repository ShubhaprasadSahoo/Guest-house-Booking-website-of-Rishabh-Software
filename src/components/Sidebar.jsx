import React from 'react'
import { Link } from 'react-router-dom'
const Sidebar = () => {
  return (
    <>
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark vh-100" style={{ width: "250px" }}>
      <h4 className="text-center mb-4">User 360°</h4>
      <ul className="nav nav-pills flex-column mb-auto">
       
        <li><Link to="/mybooking" className="nav-link text-white">My Booking</Link></li>
        <li><Link to="/myprofile" className="nav-link text-white">My Profile</Link></li>
        <li><Link to="/user-dashboard" className="nav-link text-white">Guest House Booking</Link></li>
        </ul>
            </div>

    </>
  )
}

export default Sidebar