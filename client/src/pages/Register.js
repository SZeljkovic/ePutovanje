import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [TipKorisnika, setTipKorisnika] = useState(2);
  const [formData, setFormData] = useState({
    Ime: "",
    Prezime: "",
    NazivAgencije: "",
    DatumRodjenja: "",
    KorisnickoIme: "",
    Lozinka: "",
    Email: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/register", {
        ...formData,
        TipKorisnika
      });
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Došlo je do greške. Pokušajte ponovo.");
      }
    }
  };

  return (
    <div className="register-page">
      <Navbar />
      <div className="register-container">
        <h2>Registracija</h2>
        <form className="register-form" onSubmit={handleRegister}>
          {/* Tip korisnika */}
          <label htmlFor="tip">Tip korisnika:</label>
          <select
            id="tip"
            value={TipKorisnika}
            onChange={(e) => setTipKorisnika(Number(e.target.value))}
          >
            <option value={1}>Turistička agencija</option>
            <option value={2}>Klijent</option>
          </select>

          {/* Polja za klijenta */}
          {TipKorisnika === 2 && (
            <>
              <input
                type="text"
                name="Ime"
                placeholder="Ime"
                value={formData.Ime}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="Prezime"
                placeholder="Prezime"
                value={formData.Prezime}
                onChange={handleChange}
                required
              />
              <input
                type={formData.DatumRodjenja ? "date" : "text"}
                name="DatumRodjenja"
                placeholder="Datum rođenja"
                value={formData.DatumRodjenja}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                }}
                onChange={handleChange}
                required
                />

            </>
          )}

          {/* Polje za agenciju */}
          {TipKorisnika === 1 && (
            <input
              type="text"
              name="NazivAgencije"
              placeholder="Naziv agencije"
              value={formData.NazivAgencije}
              onChange={handleChange}
              required
            />
          )}

          {/* Polja zajednička svima */}
          <input
            type="text"
            name="KorisnickoIme"
            placeholder="Korisničko ime"
            value={formData.KorisnickoIme}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="Lozinka"
            placeholder="Lozinka"
            value={formData.Lozinka}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="Email"
            placeholder="Email"
            value={formData.Email}
            onChange={handleChange}
            required
          />

          {/* Poruke */}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "lightgreen" }}>{success}</p>}

          <button type="submit">Registruj se</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
