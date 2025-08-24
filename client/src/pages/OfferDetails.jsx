import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OfferDetails.css";

const API_BASE = "http://localhost:5000";

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ Ocjena: 0, Komentar: "" });

  const [reservation, setReservation] = useState({
    BrojOdraslih: 1,
    BrojDjece: 0,
  });
  const [reservationMessage, setReservationMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(`${API_BASE}/ponuda/${id}`);
        setOffer(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju ponude:", err);
      }
    };

    const fetchRating = async () => {
      try {
        const res = await axios.get(`${API_BASE}/ponuda/${id}/ocjena`);
        setRating(res.data.averageRating);
      } catch (err) {
        console.error("Greška pri dohvatanju ocjene:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/recenzije/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju recenzija:", err);
      }
    };

    fetchOffer();
    fetchRating();
    fetchReviews();
  }, [id, token]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/recenzija`,
        { idPONUDA: id, ...newReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview({ Ocjena: 0, Komentar: "" });
      const res = await axios.get(`${API_BASE}/recenzije/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Greška prilikom slanja recenzije:", err);
      alert(err.response?.data?.error || "Neuspješno dodavanje recenzije.");
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setReservationMessage("");
    try {
      const res = await axios.post(
        `${API_BASE}/rezervisi-ponudu`,
        {
          idPONUDA: id,
          BrojOdraslih: reservation.BrojOdraslih,
          BrojDjece: reservation.BrojDjece,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservationMessage(
        `✅ ${res.data.message}. Ukupna cijena: ${res.data.ukupnaCijena} €`
      );
    } catch (err) {
      console.error("Greška pri rezervaciji:", err);
      setReservationMessage(
        `❌ ${err.response?.data?.error || "Neuspješno kreiranje rezervacije"}`
      );
    }
  };

  if (!offer) {
    return (
      <div className="offer-details">
        <p>Učitavanje ponude...</p>
      </div>
    );
  }

  return (
    <div className="offer-details">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Nazad
      </button>

      <div className="offer-header">
        <h2>{offer.Destinacije[0]?.Naziv}</h2>
        <div className="price">{offer.Cijena.toLocaleString()} BAM</div>
      </div>

      <div className="offer-meta">
      <span>
        📅 {new Date(offer.DatumPolaska).toLocaleDateString()} -{" "}
        {new Date(offer.DatumPovratka).toLocaleDateString()}
      </span>
      <span>🚌 Prevoz: {offer.TipPrevoza}</span>
      <span>🎟 Slobodna mjesta: {offer.BrojSlobodnihMjesta}</span>
      <span>🏢 Agencija: {offer.NazivAgencije + " (" + offer.KorisnickoIme + ") "}</span> {/* DODANO */}
      {offer.NajatraktivnijaPonuda && (
        <span className="deal-tag">🔥 Top ponuda</span>
      )}
    </div>


      <div className="offer-description">
        <p>{offer.Opis}</p>
      </div>

      <div className="reservation-section">
        <h3>📌 Rezervacija</h3>
        <form onSubmit={handleReservationSubmit}>
          <label>
            Broj odraslih:
            <input
              type="number"
              min="1"
              value={reservation.BrojOdraslih}
              onChange={(e) =>
                setReservation({ ...reservation, BrojOdraslih: parseInt(e.target.value) })
              }
              required
            />
          </label>
          <label>
            Broj djece:
            <input
              type="number"
              min="0"
              value={reservation.BrojDjece}
              onChange={(e) =>
                setReservation({ ...reservation, BrojDjece: parseInt(e.target.value) })
              }
              required
            />
          </label>
          <button type="submit" className="reserve-button">
            Rezerviši
          </button>
        </form>
        {reservationMessage && (
          <p className="reservation-message">{reservationMessage}</p>
        )}
      </div>

      <div className="destinations">
        <h3>Destinacije</h3>
        <ul>
          {offer.Destinacije.map((d) => (
            <li key={d.idDESTINACIJA}>
              <strong>{d.Naziv}</strong> - {d.Opis} ({d.Tip})
            </li>
          ))}
        </ul>
      </div>

      <div className="reviews-section">
        <h3>⭐ Ocjene i recenzije</h3>
        <p className="avg-rating">Prosječna ocjena: {rating}/5</p>

        <ul className="review-list">
          {reviews.length === 0 ? (
            <p>Nema recenzija za ovu ponudu.</p>
          ) : (
            reviews.map((r, index) => (
              <li key={index} className="review-item">
                <div className="review-header">
                  <strong>{r.KorisnickoIme}</strong>{" "}
                  <span className="stars">
                    {"★".repeat(r.Ocjena)}{"☆".repeat(5 - r.Ocjena)}
                  </span>
                </div>
                <p>{r.Komentar}</p>
                <span className="review-date">
                  {new Date(r.DatumIVrijeme).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>

        <form onSubmit={handleReviewSubmit} className="review-form">
          <h4>Dodaj svoju recenziju</h4>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${newReview.Ocjena >= star ? "filled" : ""}`}
                onClick={() =>
                  setNewReview({ ...newReview, Ocjena: star })
                }
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Napišite komentar (opcionalno)..."
            value={newReview.Komentar}
            onChange={(e) =>
              setNewReview({ ...newReview, Komentar: e.target.value })
            }
          />
          <button type="submit" className="submit-review">
            Pošalji recenziju
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferDetails;
