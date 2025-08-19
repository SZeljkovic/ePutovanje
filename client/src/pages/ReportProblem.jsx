import React, { useState } from "react";
import axios from "axios";
import "./ReportProblem.css";
import { useNavigate } from "react-router-dom";

const ReportProblem = () => {
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // pretpostavljam da čuvaš token u localStorage
  const API_BASE = "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        `${API_BASE}/prijavi-problem`,
        { Naslov: naslov, Sadrzaj: sadrzaj },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Problem uspješno prijavljen.");
      setNaslov("");
      setSadrzaj("");
    } catch (err) {
      console.error("Greška pri prijavi problema:", err);
      setMessage("❌ Došlo je do greške prilikom prijave problema.");
    }
  };

  return (
    <div className="report-container">
      <h2>🛠️ Prijava problema</h2>
      <form className="report-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Unesite naslov problema"
          value={naslov}
          onChange={(e) => setNaslov(e.target.value)}
          required
        />
        <textarea
          placeholder="Opišite problem"
          value={sadrzaj}
          onChange={(e) => setSadrzaj(e.target.value)}
          required
        ></textarea>
        <button type="submit">📩 Pošalji prijavu</button>
      </form>

      {message && <p className="report-message">{message}</p>}

      <button className="btn-back" onClick={() => navigate(-1)}>
        ⬅ Nazad
      </button>
    </div>
  );
};

export default ReportProblem;
