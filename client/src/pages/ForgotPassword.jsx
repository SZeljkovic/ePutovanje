import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [KorisnickoIme, setKorisnickoIme] = useState("");
  const [message, setMessage] = useState("");
  const [novaLozinka, setNovaLozinka] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setNovaLozinka("");

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", {
        KorisnickoIme,
      });

      setMessage(res.data.message);
      if (res.data.novaLozinka) {
        setNovaLozinka(res.data.novaLozinka);

        // popup sa novom lozinkom
        alert(`Vaša nova privremena lozinka je: ${res.data.novaLozinka}`);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Došlo je do greške. Pokušajte ponovo.");
      }
    }
  };

  return (
    <div className="forgot-page">
      <Navbar />
      <div className="forgot-container">
        <h2>Reset lozinke</h2>
        <form className="forgot-form" onSubmit={handleForgotPassword}>
          <input
            type="text"
            placeholder="Unesite korisničko ime"
            value={KorisnickoIme}
            onChange={(e) => setKorisnickoIme(e.target.value)}
            required
          />
          <button type="submit">Generiši novu lozinku</button>
        </form>

        {message && (
          <p className="forgot-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
