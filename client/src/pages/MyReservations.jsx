import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyReservations.css";

const API_BASE = "http://localhost:5000";

const MyReservations = () => {
  const [rezervacije, setRezervacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalji, setDetalji] = useState({});
  const [openId, setOpenId] = useState(null);
  const [otkazRazlog, setOtkazRazlog] = useState({}); // po rezervaciji
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRezervacije = async () => {
      try {
        const res = await axios.get(`${API_BASE}/moje-rezervacije`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRezervacije(res.data.rezervacije);
      } catch (err) {
        console.error("Greška pri dohvatanju rezervacija:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRezervacije();
  }, [token]);

  const toggleDetalji = async (id) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }

    if (!detalji[id]) {
      try {
        const res = await axios.get(`${API_BASE}/moje-rezervacije/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetalji({ ...detalji, [id]: res.data });
      } catch (err) {
        console.error("Greška pri dohvatanju detalja rezervacije:", err);
      }
    }

    setOpenId(id);
  };

  const handleCancel = async (id) => {
    const razlog = otkazRazlog[id];
    if (!razlog || razlog.trim() === "") {
      setMessage("Unesite razlog otkazivanja.");
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE}/moje-rezervacije/${id}/otkazi`,
        { razlogOtkazivanja: razlog },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);

      // ažuriraj status u listi rezervacija
      setRezervacije((prev) =>
        prev.map((r) =>
          r.idREZERVACIJA === id
            ? { ...r, StatusText: "Otkazano", StatusRezervacije: -2 }
            : r
        )
      );

      setOpenId(null); // zatvori detalje nakon otkazivanja
    } catch (err) {
      console.error("Greška pri otkazivanju:", err);
      setMessage(err.response?.data?.error || "Došlo je do greške.");
    }
  };

  return (
    <div className="reservations-page">
      <h2>📌 Moje rezervacije</h2>

      {message && <p className="res-message">{message}</p>}

      {loading ? (
        <p className="res-loading">Učitavanje...</p>
      ) : rezervacije.length === 0 ? (
        <p className="res-empty">Nemate rezervacija.</p>
      ) : (
        <ul className="res-list">
          {rezervacije.map((r) => (
            <li key={r.idREZERVACIJA} className="res-item">
              <p><strong>{r.OpisPonude}</strong> ({r.Destinacije})</p>
              <p>📅 {new Date(r.Datum).toLocaleDateString()}</p>
              <p>Status: {r.StatusText}</p>
              <p>Ukupna cijena: {r.UkupnaCijena} €</p>
              <button
                className="details-toggle"
                onClick={() => toggleDetalji(r.idREZERVACIJA)}
              >
                {openId === r.idREZERVACIJA ? "✖ Zatvori detalje" : "➡ Detalji"}
              </button>

              {openId === r.idREZERVACIJA && detalji[r.idREZERVACIJA] && (
                <div className="reservation-details">
                  <p><strong>Ponuda:</strong> {detalji[r.idREZERVACIJA].Opis}</p>
                  <p><strong>Agencija:</strong> {detalji[r.idREZERVACIJA].NazivAgencije}</p>
                  <p><strong>Broj odraslih:</strong> {detalji[r.idREZERVACIJA].BrojOdraslih}</p>
                  <p><strong>Broj djece:</strong> {detalji[r.idREZERVACIJA].BrojDjece}</p>
                  <p><strong>Cijena po osobi:</strong> {detalji[r.idREZERVACIJA].Cijena} BAM</p>
                  <p><strong>Ukupna cijena:</strong> {detalji[r.idREZERVACIJA].UkupnaCijena} BAM</p>
                  <p><strong>Polazak:</strong> {new Date(detalji[r.idREZERVACIJA].DatumPolaska).toLocaleDateString()}</p>
                  <p><strong>Povratak:</strong> {new Date(detalji[r.idREZERVACIJA].DatumPovratka).toLocaleDateString()}</p>
                  <p><strong>Tip prevoza:</strong> {detalji[r.idREZERVACIJA].TipPrevoza}</p>
                  <p><strong>Destinacije:</strong> {detalji[r.idREZERVACIJA].Destinacije.map(d => d.Naziv).join(", ")}</p>

                  {/* dio za otkazivanje */}
                  {detalji[r.idREZERVACIJA].StatusRezervacije === 0 ||
                  detalji[r.idREZERVACIJA].StatusRezervacije === 1 ? (
                    <div className="cancel-section">
                      <textarea
                        placeholder="Unesite razlog otkazivanja..."
                        value={otkazRazlog[r.idREZERVACIJA] || ""}
                        onChange={(e) =>
                          setOtkazRazlog({
                            ...otkazRazlog,
                            [r.idREZERVACIJA]: e.target.value,
                          })
                        }
                      />
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(r.idREZERVACIJA)}
                      >
                        ❌ Otkaži rezervaciju
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="res-actions">
        <button className="back-btn" onClick={() => navigate("/clientprofile")}>
          ⬅ Nazad
        </button>
      </div>
    </div>
  );
};

export default MyReservations;
