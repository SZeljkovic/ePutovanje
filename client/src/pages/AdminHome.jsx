import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminHome.css";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo3.png";


const AdminHome = () => {
  const navigate = useNavigate();
  const { user, token, logout, isLoading } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    Ime: "",
    Prezime: "",
    Email: "",
    StaraLozinka: "",
    NovaLozinka: ""
  });

  const [allUsers, setAllUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [agencyRequests, setAgencyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [offerRequests, setOfferRequests] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [offerDetails, setOfferDetails] = useState(null);

  const [adminForm, setAdminForm] = useState({
    Ime: "",
    Prezime: "",
    KorisnickoIme: "",
    Lozinka: "",
    Email: ""
  });

  useEffect(() => {

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.TipKorisnika !== 0) {
      navigate("/login");
    } else {
      console.log("Pristup odobren. Korisnik je administrator.");
    }

  }, [token, user, navigate, isLoading]);

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
        StaraLozinka: "",
        NovaLozinka: ""
      });
    } catch (err) {
      setError("Greška pri učitavanju profila");
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/all-profiles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(res.data.korisnici);
    } catch (err) {
      setError("Greška pri učitavanju korisnika");
    } finally {
      setLoading(false);
    }
  };

  const loadAgencyRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/agency-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgencyRequests(res.data.agencyRequests);
    } catch (err) {
      setError("Greška pri učitavanju zahtjeva agencija");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAgency = async (id) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/agency-requests/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Nalog je uspješno odobren.");
      loadAgencyRequests(); // Ponovo učitaj listu zahtjeva
      loadAllUsers(); // Ažuriraj listu svih korisnika
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri odobravanju naloga.");
    } finally {
      setLoading(false);
    }
  };

  const loadSuspendedUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/suspended-accounts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuspendedUsers(res.data.suspendovaniNalozi);
    } catch (err) {
      setError("Greška pri učitavanju suspendovanih naloga");
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

  const handleSuspendAccount = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/suspend-account/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Nalog je uspešno suspendovan");
      loadAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri suspendovanju naloga");
    }
  };

  const handleReactivateAccount = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/reactivate-account/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Nalog je uspešno reaktiviran");
      loadSuspendedUsers();
      loadAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri reaktivaciji naloga");
    }
  };

  const handleDeleteAccount = async (userId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj nalog?")) {
      try {
        await axios.delete(`http://localhost:5000/delete-profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Nalog je uspešno obrisan");
        loadAllUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Greška pri brisanju naloga");
      }
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post("http://localhost:5000/register-admin", adminForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Administratorski nalog je uspešno kreiran");
      setAdminForm({
        Ime: "",
        Prezime: "",
        KorisnickoIme: "",
        Lozinka: "",
        Email: ""
      });
      loadAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri kreiranju naloga");
    } finally {
      setLoading(false);
    }
  };

  const loadOfferRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/zahtjevi-ponuda", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfferRequests(res.data);
    } catch (err) {
      setError("Greška pri učitavanju zahtjeva za ponude.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/ponude");
      setAllOffers(res.data);
    } catch (err) {
      setError("Greška pri učitavanju svih ponuda.");
    } finally {
      setLoading(false);
    }
  };

  const handleOfferStatusUpdate = async (offerId, status) => {
    try {
      setLoading(true);
      const action = status === 1 ? 'odobrena' : 'poništena';
      await axios.put(`http://localhost:5000/zahtjevi-ponuda/${offerId}/status`, { StatusPonude: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Ponuda je uspješno ${action}.`);
      loadOfferRequests(); // Ponovo učitaj zahtjeve
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri ažuriranju statusa ponude.");
    } finally {
      setLoading(false);
    }
  };


  const filteredUsers = allUsers.filter(user => {
    if (!user) {
      return false;
    }

    const ime = user.Ime || "";
    const prezime = user.Prezime || "";
    const korisnickoIme = user.KorisnickoIme || "";
    const email = user.Email || "";

    const searchTermLower = searchTerm.toLowerCase();

    return (
      ime.toLowerCase().includes(searchTermLower) ||
      prezime.toLowerCase().includes(searchTermLower) ||
      korisnickoIme.toLowerCase().includes(searchTermLower) ||
      email.toLowerCase().includes(searchTermLower)
    );
  });


  useEffect(() => {
    if (activeSection === "profile") {
      loadProfile();
    } else if (activeSection === "users") {
      loadAllUsers();
    } else if (activeSection === "suspended") {
      loadSuspendedUsers();
    } else if (activeSection === "requests") {
      loadAgencyRequests();
    } else if (activeSection === "offer-requests") { // NOVO
      loadOfferRequests();
    } else if (activeSection === "offers") { // NOVO
      loadAllOffers();
    }
    else if (activeSection === "dashboard") {
    loadAllUsers(); // ✅ dodaj ovo
    loadSuspendedUsers(); // ✅ ako koristiš i suspendedUsers.length
  }
  }, [activeSection, token]);

  const getTipKorisnikaText = (tip) => {
    switch (tip) {
      case 0: return "Administrator";
      case 1: return "Agencija";
      case 2: return "Klijent";
      default: return "Nepoznato";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return "Aktivan";
      case 0: return "Neaktivan";
      case -1: return "Suspendovan";
      default: return "Nepoznato";
    }
  };

  return (
    <div className="admin-page">
      {/* <Navbar /> */}
      <header className="admin-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="h-44" />
        </div>

        <div className="header-right">
          <button onClick={() => setActiveSection("profile")}>Moj Profil</button>
          <button className="notif-btn" onClick={() => alert("Notifikacije će biti ovdje 😉")}>🔔</button>
          <button className="logout-btn-header" onClick={() => { logout(); navigate("/"); }}>Odjavi se</button>
        </div>
      </header>


      <div className="admin-container">
        <div className="admin-sidebar">
          <h3>Admin Panel</h3>
          <nav className="admin-nav">
            <div
              className={activeSection === "dashboard" ? "menu-item active" : "menu-item"}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </div>

            <div className="menu-item">
              Nalozi
              <div className="submenu">
                <div onClick={() => setActiveSection("users")}>Svi korisnici</div>
                <div onClick={() => setActiveSection("suspended")}>Suspendovani nalozi</div>
                <div onClick={() => setActiveSection("requests")}>Zahtjevi</div>
                <div onClick={() => setActiveSection("create-admin")}>Kreiraj Admin</div>
              </div>
            </div>

            <div className="menu-item">
              Ponude
              <div className="submenu">
                <div onClick={() => setActiveSection("offers")}>Sve ponude</div>
                <div onClick={() => setActiveSection("offer-requests")}>Zahtjevi</div>
              </div>
            </div>

            <div className="menu-item" onClick={() => setActiveSection("destinations")}>
              Destinacije
            </div>
          </nav>
        </div>



        <div className="admin-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="dashboard-section">
              <h2>Dobrodošli, {user?.KorisnickoIme}!</h2>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h4>Ukupno korisnika</h4>
                  <p>{allUsers.length}</p>
                </div>
                <div className="stat-card">
                  <h4>Suspendovani nalozi</h4>
                  <p>{suspendedUsers.length}</p>
                </div>
                <div className="stat-card">
                  <h4>Administratori</h4>
                  <p>{allUsers.filter(u => u.TipKorisnika === 0).length}</p>
                </div>
                <div className="stat-card">
                  <h4>Agencije</h4>
                  <p>{allUsers.filter(u => u.TipKorisnika === 1).length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Moj Profil */}
          {activeSection === "profile" && (
            <div className="profile-section">
              <h2>Moj Profil</h2>
              {loading ? (
                <p>Učitavanje...</p>
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
          )}

          {/* Svi Korisnici */}
          {activeSection === "users" && (
            <div className="users-section">
              <h2>Upravljanje Korisnicima</h2>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Pretraži korisnike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <p>Učitavanje...</p>
              ) : (
                <div className="users-table">
                  {filteredUsers.map(user => (
                    <div key={user.idKORISNIK} className="user-card">
                      <div className="user-info">
                        {user.NazivAgencije ? (
                          <h4>{user.NazivAgencije}</h4>
                        ) : (
                          <h4>{user.Ime} {user.Prezime}</h4>
                        )}
                        <p><strong>Korisničko ime:</strong> {user.KorisnickoIme}</p>
                        <p><strong>Email:</strong> {user.Email}</p>
                        <p><strong>Tip:</strong> {getTipKorisnikaText(user.TipKorisnika)}</p>
                        <p><strong>Status:</strong> {getStatusText(user.StatusNaloga)}</p>
                      </div>
                      <div className="user-actions">
                        {user.idKORISNIK !== profile?.idKORISNIK && (
                          <button
                            onClick={() => handleSuspendAccount(user.idKORISNIK)}
                            className="suspend-btn">
                            Suspenduj
                          </button>
                        )}
                        {user.idKORISNIK !== profile?.idKORISNIK && (
                          <button
                            onClick={() => handleDeleteAccount(user.idKORISNIK)}
                            className="delete-btn">
                            Obriši
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suspendovani Nalozi */}
          {activeSection === "suspended" && (
            <div className="suspended-section">
              <h2>Suspendovani Nalozi</h2>
              {loading ? (
                <p>Učitavanje...</p>
              ) : (
                <div className="users-table">
                  {suspendedUsers.map(user => (
                    <div key={user.idKORISNIK} className="user-card">
                      <div className="user-info">
                        <h4>{user.Ime} {user.Prezime}</h4>
                        <p><strong>Korisničko ime:</strong> {user.KorisnickoIme}</p>
                        <p><strong>Email:</strong> {user.Email}</p>
                        <p><strong>Tip:</strong> {getTipKorisnikaText(user.TipKorisnika)}</p>
                        {user.NazivAgencije && <p><strong>Agencija:</strong> {user.NazivAgencije}</p>}
                      </div>
                      <div className="user-actions">
                        <button
                          onClick={() => handleReactivateAccount(user.idKORISNIK)}
                          className="reactivate-btn"
                        >
                          Reaktiviraj
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(user.idKORISNIK)}
                          className="delete-btn"
                        >
                          Obriši
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Zahtjevi agencija */}
          {activeSection === "requests" && (
            <div className="requests-section">
              <h2>Zahtjevi za registraciju agencija</h2>
              {loading ? (
                <p>Učitavanje...</p>
              ) : agencyRequests.length > 0 ? (
                <div className="users-table">
                  {agencyRequests.map(request => (
                    <div key={request.idKORISNIK} className="user-card">
                      <div className="user-info">
                        <h4>{request.NazivAgencije}</h4>
                        <p><strong>Korisničko ime:</strong> {request.KorisnickoIme}</p>
                        <p><strong>Email:</strong> {request.Email}</p>
                      </div>
                      <div className="user-actions">
                        <button
                          onClick={() => handleApproveAgency(request.idKORISNIK)}
                          className="approve-btn">
                          Odobri
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(request.idKORISNIK)}
                          className="delete-btn">
                          Odbij
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nema novih zahtjeva za odobravanje.</p>
              )}
            </div>
          )}


          {/* Kreiraj Admin */}
          {activeSection === "create-admin" && (
            <div className="create-admin-section">
              <h2>Kreiraj Administratorski Nalog</h2>
              <form onSubmit={handleCreateAdmin} className="admin-form">
                <input
                  type="text"
                  placeholder="Ime"
                  value={adminForm.Ime}
                  onChange={(e) => setAdminForm({ ...adminForm, Ime: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Prezime"
                  value={adminForm.Prezime}
                  onChange={(e) => setAdminForm({ ...adminForm, Prezime: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Korisničko ime"
                  value={adminForm.KorisnickoIme}
                  onChange={(e) => setAdminForm({ ...adminForm, KorisnickoIme: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Lozinka"
                  value={adminForm.Lozinka}
                  onChange={(e) => setAdminForm({ ...adminForm, Lozinka: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={adminForm.Email}
                  onChange={(e) => setAdminForm({ ...adminForm, Email: e.target.value })}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Kreiranje..." : "Kreiraj Admin Nalog"}
                </button>
              </form>
            </div>
          )}

          {/* Zahtjevi za Ponude */}
          {activeSection === "offer-requests" && (
            <div className="requests-section">
              <h2>Zahtjevi za ponude</h2>
              {loading ? (
                <p>Učitavanje...</p>
              ) : offerRequests.length > 0 ? (
                <div className="requests-list">
                  {offerRequests.map(offer => (
                    <div key={offer.idPONUDA} className="offer-card">
                      <div className="offer-info">
                        {/* Dodavanje svih informacija iz baze */}
                        <h4>Ponuda za: {offer.NazivDestinacije || "Nije definirano"}</h4>
                        <p><strong>Cijena:</strong> {offer.Cijena} KM</p>
                        <p><strong>Datum polaska:</strong> {new Date(offer.DatumPolaska).toLocaleDateString()}</p>
                        <p><strong>Datum povratka:</strong> {new Date(offer.DatumPovratka).toLocaleDateString()}</p>
                        <p><strong>Tip prevoza:</strong> {offer.TipPrevoza}</p>
                        <p><strong>Broj mjesta:</strong> {offer.BrojSlobodnihMjesta}</p>
                        <p><strong>Najatraktivnija ponuda:</strong> {offer.NajatraktivnijaPonuda ? 'Da' : 'Ne'}</p>
                        <p><strong>Opis:</strong> {offer.Opis}</p>
                        {/* Ovdje se mogu dodati i informacije o agenciji (iz `/zahtjevi-ponuda/:id` rute) ako su dostupne */}
                        {offer.NazivAgencije && <p><strong>Agencija:</strong> {offer.NazivAgencije}</p>}
                      </div>
                      <div className="offer-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleOfferStatusUpdate(offer.idPONUDA, 1)}
                        >
                          Odobri
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleOfferStatusUpdate(offer.idPONUDA, -1)}
                        >
                          Odbij
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Nema novih zahtjeva za ponude.</p>
              )}
            </div>
          )}

          {/* Sve Ponude (aktivne) */}
          {activeSection === "offers" && (
            <div className="offers-section">
              <h2>Sve aktivne ponude</h2>
              {loading ? (
                <p>Učitavanje...</p>
              ) : allOffers.length > 0 ? (
                <div className="offers-list">
                  {allOffers.map(offer => (
                    <div key={offer.idPONUDA} className="offer-card">
                      <div className="offer-info">
                        {/* Prikaz svih informacija za aktivne ponude */}
                        <h4>Ponuda za: {offer.Destinacije.map(d => d.Naziv).join(", ")}</h4>
                        <p><strong>Agencija:</strong> {offer.idKORISNIK}</p>
                        <p><strong>Cijena:</strong> {offer.Cijena} KM</p>
                        <p><strong>Datum polaska:</strong> {new Date(offer.DatumPolaska).toLocaleDateString()}</p>
                        <p><strong>Datum povratka:</strong> {new Date(offer.DatumPovratka).toLocaleDateString()}</p>
                        <p><strong>Tip prevoza:</strong> {offer.TipPrevoza}</p>
                        <p><strong>Broj mjesta:</strong> {offer.BrojSlobodnihMjesta}</p>
                        <p><strong>Najatraktivnija ponuda:</strong> {offer.NajatraktivnijaPonuda ? 'Da' : 'Ne'}</p>
                        <p><strong>Opis:</strong> {offer.Opis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Trenutno nema aktivnih ponuda.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>


  );
};

export default AdminHome;