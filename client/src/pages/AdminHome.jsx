import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminHome.css";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header/Header";
import MyProfile from "../components/MyProfile/MyProfile";


const AdminHome = () => {
  const navigate = useNavigate();
  const { user, token, logout, isLoading } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState(null);

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

  const [destinations, setDestinations] = useState([]);
  const [destinationForm, setDestinationForm] = useState({
    Naziv: "",
    Opis: "",
    Tip: ""
  });

  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSectionChange = (newSection) => {
    setActiveSection(newSection);
    setError("");
    setSuccess("");
  };


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
      loadAgencyRequests();
      loadAllUsers();
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
      loadOfferRequests();
      loadAllOffers();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri ažuriranju statusa ponude.");
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/destinacije", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDestinations(res.data);
    } catch (err) {
      setError("Greška pri učitavanju destinacija");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post("http://localhost:5000/dodaj-destinaciju", destinationForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Destinacija je uspješno dodana");
      setDestinationForm({
        Naziv: "",
        Opis: "",
        Tip: ""
      });
      loadDestinations();
    } catch (err) {
      setError(err.response?.data?.error || "Greška pri dodavanju destinacije");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu destinaciju?")) {
      try {
        await axios.delete(`http://localhost:5000/destinacija/${destinationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Destinacija je uspješno obrisana");
        loadDestinations();
      } catch (err) {
        setError(err.response?.data?.error || "Greška pri brisanju destinacije");
      }
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
    if (activeSection === "users") {
      loadAllUsers();
    } else if (activeSection === "suspended") {
      loadSuspendedUsers();
    } else if (activeSection === "requests") {
      loadAgencyRequests();
    } else if (activeSection === "offer-requests") {
      loadOfferRequests();
    } else if (activeSection === "offers") {
      loadAllOffers();
    } else if (activeSection === "dashboard") {
      loadAllUsers();
      loadSuspendedUsers();
    } else if (activeSection === "destinations") {
      loadDestinations();
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
      <Header
        setActiveSection={setActiveSection}
        logout={logout}
        navigate={navigate}
      />

      <div className="admin-container">
        <div className="admin-sidebar">
          <h3>Admin Panel</h3>
          <nav className="admin-nav">
            <div
              className={activeSection === "dashboard" ? "menu-item active" : "menu-item"}
              onClick={() => handleSectionChange("dashboard")}
            >
              Dashboard
            </div>

            <div className="menu-item">
              Nalozi
              <div className="submenu">
                <div onClick={() => handleSectionChange("users")}>Svi korisnici</div>
                <div onClick={() => handleSectionChange("suspended")}>Suspendovani nalozi</div>
                <div onClick={() => handleSectionChange("requests")}>Zahtjevi</div>
                <div onClick={() => handleSectionChange("create-admin")}>Kreiraj Admin</div>
              </div>
            </div>

            <div className="menu-item">
              Ponude
              <div className="submenu">
                <div onClick={() => handleSectionChange("offers")}>Sve ponude</div>
                <div onClick={() => handleSectionChange("offer-requests")}>Zahtjevi</div>
              </div>
            </div>

            <div className="menu-item" onClick={() => handleSectionChange("destinations")}>
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
            <MyProfile
              token={token}
              setError={setError}
              setSuccess={setSuccess}
              setLoading={setLoading}
              loading={loading}
            />
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
                        <h4>Ponuda za: {offer.NazivDestinacije || "Nije definirano"}</h4>
                        <p><strong>Cijena:</strong> {offer.Cijena} KM</p>
                        <p><strong>Datum polaska:</strong> {new Date(offer.DatumPolaska).toLocaleDateString()}</p>
                        <p><strong>Datum povratka:</strong> {new Date(offer.DatumPovratka).toLocaleDateString()}</p>
                        <p><strong>Tip prevoza:</strong> {offer.TipPrevoza}</p>
                        <p><strong>Broj mjesta:</strong> {offer.BrojSlobodnihMjesta}</p>
                        <p><strong>Najatraktivnija ponuda:</strong> {offer.NajatraktivnijaPonuda ? 'Da' : 'Ne'}</p>
                        <p><strong>Opis:</strong> {offer.Opis}</p>
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

          {/* Destinacije */}
          {activeSection === "destinations" && (
            <div className="destinations-section">
              <h2>Upravljanje Destinacijama</h2>

              <div className="add-destination-form">
                <h3 style={{ textAlign: 'left' }}>Dodaj novu destinaciju</h3>
                <form onSubmit={handleAddDestination} className="admin-form">
                  <input
                    type="text"
                    placeholder="Naziv destinacije"
                    value={destinationForm.Naziv}
                    onChange={(e) => setDestinationForm({ ...destinationForm, Naziv: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Opis destinacije"
                    value={destinationForm.Opis}
                    onChange={(e) => setDestinationForm({ ...destinationForm, Opis: e.target.value })}
                    required
                    rows="4"
                  />
                  <select
                    value={destinationForm.Tip}
                    onChange={(e) => setDestinationForm({ ...destinationForm, Tip: e.target.value })}
                    required
                  >
                    <option value="">Izaberite tip destinacije</option>
                    <option value="Grad">Grad</option>
                    <option value="Zemlja">Zemlja</option>
                    <option value="Regija">Regija</option>
                    <option value="Kontinent">Kontinent</option>
                    <option value="Ostrvo">Ostrvo</option>
                    <option value="Planina">Planina</option>
                    <option value="More/Okean">More/Okean</option>
                  </select>
                  <button type="submit" disabled={loading}>
                    {loading ? "Dodavanje..." : "Dodaj Destinaciju"}
                  </button>
                </form>
              </div>

              <div className="destinations-list">
                <h3>Sve destinacije</h3>
                {loading ? (
                  <p>Učitavanje...</p>
                ) : destinations.length > 0 ? (
                  <div className="destinations-table">
                    {destinations.map(destination => (
                      <div key={destination.idDESTINACIJA} className="destination-card">
                        <div className="destination-info">
                          <h4>{destination.Naziv}</h4>
                          <p><strong>Tip:</strong> {destination.Tip}</p>
                          <p><strong>Opis:</strong> {destination.Opis}</p>
                        </div>
                        <div className="destination-actions">
                          <button
                            onClick={() => handleDeleteDestination(destination.idDESTINACIJA)}
                            className="delete-btn"
                          >
                            Obriši
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Trenutno nema destinacija u bazi.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default AdminHome;