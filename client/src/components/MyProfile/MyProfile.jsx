import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyProfile.css";

const MyProfile = ({ token, setError, setSuccess, setLoading, loading }) => {
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    Ime: "",
    Prezime: "",
    Email: "",
    NazivAgencije: "",
    DatumRodjenja: "",
    StaraLozinka: "",
    NovaLozinka: ""
  });

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      setProfileForm({
        Ime: res.data.user.Ime,
        Prezime: res.data.user.Prezime,
        Email: res.data.user.Email,
        NazivAgencije: res.data.user.NazivAgencije || "",
        DatumRodjenja: res.data.user.DatumRodjenja || "",
        StaraLozinka: "",
        NovaLozinka: ""
      });
    } catch (err) {
      setError("Greška pri učitavanju profila");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.put("http://localhost:5000/edit-profile", profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Profil je uspešno ažuriran");
      setEditingProfile(false);
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri ažuriranju profila");
    } finally {
      setLoading(false);
    }
  };

  const getTipKorisnikaText = (tip) => {
    switch (tip) {
      case 0: return "Administrator";
      case 1: return "Agencija";
      case 2: return "Klijent";
      default: return "Nepoznato";
    }
  };

  return (
    <div className="profile-section">
      <h2>Moj Profil</h2>
      {loading ? (
        <p className="loading-text">Učitavanje...</p>
      ) : profile ? (
        <div className="profile-content">
          {!editingProfile ? (
            <div className="profile-view">
              <div className="profile-info">
                <p><strong>Ime:</strong> {profile.Ime}</p>
                <p><strong>Prezime:</strong> {profile.Prezime}</p>
                <p><strong>Email:</strong> {profile.Email}</p>
                {profile.NazivAgencije && <p><strong>Naziv Agencije:</strong> {profile.NazivAgencije}</p>}
                {profile.DatumRodjenja && <p><strong>Datum rođenja:</strong> {new Date(profile.DatumRodjenja).toLocaleDateString()}</p>}
                <p><strong>Korisničko ime:</strong> {profile.KorisnickoIme}</p>
                <p><strong>Tip korisnika:</strong> {getTipKorisnikaText(profile.TipKorisnika)}</p>
              </div>
              <button onClick={() => setEditingProfile(true)} className="edit-btn">
                Uredi Profil
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <input
                type="text"
                placeholder="Ime"
                value={profileForm.Ime}
                onChange={(e) => setProfileForm({ ...profileForm, Ime: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Prezime"
                value={profileForm.Prezime}
                onChange={(e) => setProfileForm({ ...profileForm, Prezime: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={profileForm.Email}
                onChange={(e) => setProfileForm({ ...profileForm, Email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Naziv Agencije"
                value={profileForm.NazivAgencije || ""}
                onChange={(e) => setProfileForm({ ...profileForm, NazivAgencije: e.target.value })}
              />
              <input
                type="date"
                placeholder="Datum rođenja"
                value={profileForm.DatumRodjenja ? profileForm.DatumRodjenja.split("T")[0] : ""}
                onChange={(e) => setProfileForm({ ...profileForm, DatumRodjenja: e.target.value })}
              />
              <input
                type="password"
                placeholder="Stara lozinka (za promenu lozinke)"
                value={profileForm.StaraLozinka}
                onChange={(e) => setProfileForm({ ...profileForm, StaraLozinka: e.target.value })}
              />
              <input
                type="password"
                placeholder="Nova lozinka"
                value={profileForm.NovaLozinka}
                onChange={(e) => setProfileForm({ ...profileForm, NovaLozinka: e.target.value })}
              />
              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Ažuriranje..." : "Sačuvaj"}
                </button>
                <button type="button" onClick={() => setEditingProfile(false)}>
                  Otkaži
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MyProfile;