import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Dashboard";
import AdminBookingForm from "./components/AdminBookingForm";
import AdminBookingList from "./components/AdminBookingList";
import UserDashboard from "./components/UserDashboard"

import AdminGuestHousePage from "./components/AdminGuestHousePage";
import {Link} from "react-router-dom"
import MyBookings from "./components/MyBookings";
import MyProfile from "./components/MyProfile";
import EditProfile from "./pages/EditProfile";
import Adminprofile from "./components/Adminprofile";
import EditAdminProfile from "./components/EditAdminProfile";
import AuditLogs from "./pages/AuditLogs";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    
    
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin-dashboard"  element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}/>
        <Route path="/user-dashboard" element={<UserDashboard/>}/>
      <Route path="/booking" element={<AdminGuestHousePage/>}/>
        <Route path="/report" element={<AdminBookingList/>}/>
        <Route path="/room"element={<AdminGuestHousePage/>}/>
        <Route path="/bed" element={<AdminGuestHousePage/>}/>
        <Route path="/mybooking" element={<MyBookings/>}/>
        <Route path="/myprofile" element={<MyProfile/>}/>
        <Route path="/edit-profile" element={<EditProfile/>}/>
        <Route path="adminprofile" element={<Adminprofile/>}/>
        <Route path="/edit-adminprofile" element={<EditAdminProfile/>}/>
        <Route path="/audit" element={<AuditLogs/>}/>
    </Routes>
    </Router>
     );
}
export default App;
