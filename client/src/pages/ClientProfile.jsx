import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./ClientProfile.css";

const API_BASE = "http://localhost:5000";

const ClientProfile = () => {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    Ime: "",
    Prezime: "",
    NazivAgencije: "",
    DatumRodjenja: "",
    Email: "",
    StaraLozinka: "",
    NovaLozinka: ""
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfil(res.data.user);
        setEditData({
          Ime: res.data.user.Ime || "",
          Prezime: res.data.user.Prezime || "",
          NazivAgencije: res.data.user.NazivAgencije || "",
          DatumRodjenja: res.data.user.DatumRodjenja
            ? res.data.user.DatumRodjenja.split("T")[0]
            : "",
          Email: res.data.user.Email || "",
          StaraLozinka: "",
          NovaLozinka: "",
        });
      } catch (err) {
        console.error("Greška pri dohvatanju profila:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [token]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.put(`${API_BASE}/edit-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || "Profil ažuriran.");
      setProfil(res.data.user);
      setEditData({ ...editData, StaraLozinka: "", NovaLozinka: "" });
    } catch (err) {
      console.error("Greška pri ažuriranju profila:", err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Došlo je do greške.");
      }
    }
  };

  return (
    <div className="client-profile-page">
      <h2>👤 Moj profil</h2>

      {loading ? (
        <p>Učitavanje...</p>
      ) : profil ? (
        <div className="profile-container">
          <div className="profile-info">
            <p><strong>Ime:</strong> {profil.Ime}</p>
            <p><strong>Prezime:</strong> {profil.Prezime}</p>
            <p><strong>Korisničko ime:</strong> {profil.KorisnickoIme}</p>
            <p><strong>Email:</strong> {profil.Email}</p>
            <p><strong>Datum rođenja:</strong> {profil.DatumRodjenja ? profil.DatumRodjenja.split("T")[0] : "N/A"}</p>
            <p><strong>Status naloga:</strong> {profil.StatusNaloga}</p>
          </div>

          <form className="profile-edit-form" onSubmit={handleSave}>
            <h3>✏️ Uredi podatke</h3>
            <input type="text" name="Ime" value={editData.Ime} onChange={handleChange} placeholder="Ime" />
            <input type="text" name="Prezime" value={editData.Prezime} onChange={handleChange} placeholder="Prezime" />
            <input type="text" name="NazivAgencije" value={editData.NazivAgencije} onChange={handleChange} placeholder="Naziv agencije (ako postoji)" />
            <input type="date" name="DatumRodjenja" value={editData.DatumRodjenja} onChange={handleChange} />
            <input type="email" name="Email" value={editData.Email} onChange={handleChange} placeholder="Email" />
            <input type="password" name="StaraLozinka" value={editData.StaraLozinka} onChange={handleChange} placeholder="Stara lozinka" />
            <input type="password" name="NovaLozinka" value={editData.NovaLozinka} onChange={handleChange} placeholder="Nova lozinka" />

            {message && <p className="profile-message">{message}</p>}

            <button type="submit">💾 Sačuvaj promjene</button>
          </form>
        </div>
      ) : (
        <p>Greška pri učitavanju profila.</p>
      )}

      <div className="profile-actions">
        <button className="back-btn" onClick={() => navigate("/")}>⬅ Nazad</button>
        <Link to="/notifications" className="notif-link">🔔 Moja obavještenja</Link>
        <Link to="/myreservations" className="reservations-link">📌 Moje rezervacije</Link>
      </div>
    </div>
  );
};

export default ClientProfile;
