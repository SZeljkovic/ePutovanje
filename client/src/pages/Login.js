import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./Login.css";
import { AuthContext } from "../context/AuthContext";
import { Link } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [KorisnickoIme, setKorisnickoIme] = useState("");
  const [Lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.put("http://localhost:5000/login", {
        KorisnickoIme,
        Lozinka
      });

      // umjesto localStorage direktno -> context login()
      login(res.data.token, res.data.korisnik.TipKorisnika, res.data.korisnik.KorisnickoIme);

      if (res.data.korisnik.TipKorisnika === 0) {
        navigate("/admin");
      } else if (res.data.korisnik.TipKorisnika === 1) {
        navigate("/agency");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Došlo je do greške. Pokušajte ponovo.");
      }
    }
  };


return (
  <div className="login-page">
    <Navbar />
    <div className="login-container">
      <h2>Prijava</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Korisničko ime"
          value={KorisnickoIme}
          onChange={(e) => setKorisnickoIme(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={Lozinka}
          onChange={(e) => setLozinka(e.target.value)}
          required
        />
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <button type="submit">Prijavi se</button>
      </form>
      <p style={{ color: "#fff", marginTop: "15px" }}>
        Nemate nalog?{" "}
        <Link to="/register" style={{ color: "#ff9800", textDecoration: "underline" }}>
          Registrujte se
        </Link>
      </p>
    </div>
  </div>
);

};

export default Login;
