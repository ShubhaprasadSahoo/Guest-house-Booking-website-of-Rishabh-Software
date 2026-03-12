import React, { useEffect, useState } from "react";
import axios from "axios";
import MainPage from "../components/MainPage";
import Navbar from "../components/Navbar";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  // 🔹 Load logged-in user (same as AdminGuestHousePage.jsx)
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/auth/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.error("User load failed:", err);
        localStorage.removeItem("token");
      });
  }, []);

  // 🔹 Load audit logs
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/audits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        console.error("Audit logs returned non-array:", res.data);
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
    }
  };

  const badgeColor = (action) => {
    if (action.includes("CREATED")) return "bg-success text-white px-3 py-1 rounded-pill";
    if (action.includes("TOGGLED")) return "bg-dark text-white px-3 py-1 rounded-pill";
    return "bg-primary text-white px-3 py-1 rounded-pill";
  };

  return (
    <div className="d-flex">

      {/* SIDEBAR FIXED LEFT */}
      <div
        style={{
          width: "250px",
          position: "fixed",
          top: 0,
          bottom: 0,
          overflow: "hidden",
          borderRight: "1px solid #ddd",
          background: "#fff",
          zIndex: 1000,
        }}
      >
        <MainPage />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1" style={{ marginLeft: "250px" }}>

        {/* NAVBAR FIXED TOP, WITH USER */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "250px",
            right: 0,
            zIndex: 900,
            background: "#fff",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Navbar user={user} />
        </div>

        {/* PAGE CONTENT: SCROLLABLE */}
        <div
          className="container-fluid"
          style={{
            marginTop: "80px",
            height: "calc(100vh - 80px)",
            overflowY: "auto",
            paddingBottom: "40px",
          }}
        >
          <h3 className="fw-bold">Audit Logs</h3>
          <p className="text-muted">Total Logs: {logs.length}</p>

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Performed By</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className={badgeColor(log.action)}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.performedBy?.role}</td>
                    <td>
                      <pre className="m-0">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
