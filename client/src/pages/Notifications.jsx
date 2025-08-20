import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";

const API_BASE = "http://localhost:5000"; // prilagodi port ako treba

const Notifications = () => {
  const [notifikacije, setNotifikacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifikacije = async () => {
      try {
        const res = await axios.get(`${API_BASE}/obavjestenja`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifikacije(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju obavještenja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikacije();
  }, [token]);

  return (
    <div className="notifications-page">
      <h2>🔔 Moja obavještenja</h2>

      {loading ? (
        <p className="notif-loading">Učitavanje...</p>
      ) : notifikacije.length === 0 ? (
        <p className="notif-empty">Nemate obavještenja.</p>
      ) : (
        <ul className="notif-list">
          {notifikacije.map((n) => (
            <li
              key={n.idOBAVJEŠTENJE}
              className={`notif-item ${n.Pročitano ? "read" : "unread"}`}
            >
              <p className="notif-text">{n.Sadržaj}</p>
              <span className="notif-date">
                {new Date(n.DatumVrijeme).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Dugme nazad */}
      <div className="notif-back-wrapper">
        <button className="notif-back-btn" onClick={() => navigate(-1)}>
          ⬅ Nazad
        </button>
      </div>
    </div>
  );
};

export default Notifications;
