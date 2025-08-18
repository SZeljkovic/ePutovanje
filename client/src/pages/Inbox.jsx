import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inbox.css";

const API_BASE = "http://localhost:5000"; // prilagodi port ako je drugi

const Inbox = () => {
  const [chatovi, setChatovi] = useState([]);
  const [odabraniChat, setOdabraniChat] = useState(null);
  const [poruke, setPoruke] = useState([]);
  const [novaPoruka, setNovaPoruka] = useState("");
  const [korisnickoImePrimaoca, setKorisnickoImePrimaoca] = useState("");

  const token = localStorage.getItem("token");

  // Učitavanje chatova
  useEffect(() => {
    const fetchChatovi = async () => {
      try {
        const res = await axios.get(`${API_BASE}/chatovi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatovi(res.data);
      } catch (err) {
        console.error("Greška pri učitavanju chatova:", err);
      }
    };
    fetchChatovi();
  }, [token]);

  // Učitavanje poruka za odabrani chat
  const otvoriChat = async (idČET) => {
    setOdabraniChat(idČET);
    try {
      const res = await axios.get(`${API_BASE}/chatovi/${idČET}/poruke`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoruke(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju poruka:", err);
    }
  };

  // Povratak na listu chatova
  const zatvoriChat = () => {
    setOdabraniChat(null);
    setPoruke([]);
    setNovaPoruka("");
  };

  // Slanje poruke
  const posaljiPoruku = async () => {
    if (!novaPoruka.trim()) return;

    try {
      await axios.post(
        `${API_BASE}/poruka`,
        odabraniChat
          ? { sadrzaj: novaPoruka, idČET: odabraniChat }
          : { korisnickoImePrimaoca, sadrzaj: novaPoruka },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNovaPoruka("");
      if (odabraniChat) otvoriChat(odabraniChat);
    } catch (err) {
      console.error("Greška pri slanju poruke:", err);
    }
  };

  return (
    <div className="inbox-container">
      <div className="chat-list">
        <h2>Moji chatovi</h2>
        {chatovi.length === 0 ? (
          <p>Nemaš aktivnih chatova.</p>
        ) : (
          <ul>
            {chatovi.map((chat) => (
              <li
                key={chat.idČET}
                onClick={() => otvoriChat(chat.idČET)}
                className={odabraniChat === chat.idČET ? "active" : ""}
              >
                {chat.Ime} {chat.Prezime} ({chat.KorisnickoIme})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-window">
        {odabraniChat ? (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={zatvoriChat}>
                ⬅ Nazad
              </button>
              <h3>Chat #{odabraniChat}</h3>
            </div>

            <div className="messages">
              {poruke.map((p) => (
                <div
                  key={p.idPORUKA}
                  className={`message ${
                    p.idPOŠILJALAC === parseInt(localStorage.getItem("userId"))
                      ? "sent"
                      : "received"
                  }`}
                >
                  <span className="sender">{p.KorisnickoIme}:</span>{" "}
                  {p.Sadržaj}
                  <div className="time">
                    {new Date(p.VrijemeSlanja).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="input-area">
              <input
                type="text"
                value={novaPoruka}
                onChange={(e) => setNovaPoruka(e.target.value)}
                placeholder="Unesi poruku..."
              />
              <button onClick={posaljiPoruku}>Pošalji</button>
            </div>
          </>
        ) : (
          <div className="new-chat">
            <h3>Pošalji novu poruku</h3>
            <div className="form-group">
              <label>Korisničko ime primaoca:</label>
              <input
                type="text"
                value={korisnickoImePrimaoca}
                onChange={(e) => setKorisnickoImePrimaoca(e.target.value)}
                placeholder="npr. marko123"
              />
            </div>
            <div className="form-group">
              <label>Poruka:</label>
              <textarea
                value={novaPoruka}
                onChange={(e) => setNovaPoruka(e.target.value)}
                placeholder="Unesi poruku..."
              />
            </div>
            <button className="send-btn" onClick={posaljiPoruku}>
              📩 Pošalji
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
