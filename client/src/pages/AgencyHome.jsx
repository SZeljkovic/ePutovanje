import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./AgencyHome.css";

const API_BASE = "http://localhost:5000";

const AgencyHome = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState({
    ukupnoZahtjeva: 0,
    prihvaceneRezervacije: 0,
    odbijeneRezervacije: 0,
    aktivnePonude: 0,
    ponudeNaCekanju: 0
  });
  const [zahtjevi, setZahtjevi] = useState([]);
  const [rezervacije, setRezervacije] = useState([]);
  const [ponudeOdobrene, setPonudeOdobrene] = useState([]);
  const [ponudeNeodobrene, setPonudeNeodobrene] = useState([]);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destinacije, setDestinacije] = useState([]);
  const [odabraniZahtjev, setOdabraniZahtjev] = useState(null);
  const [odabranaPonuda, setOdabranaPonuda] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [ponudaForm, setPonudaForm] = useState({});
  const [odabranaRezervacija, setOdabranaRezervacija] = useState(null);
  const [profilKorisnika, setProfilKorisnika] = useState(null);
  const [odbijeneRezervacije, setOdbijeneRezervacije] = useState([]);
  const [profilForm, setProfilForm] = useState({});
  const [rezervacijePonude, setRezervacijePonude] = useState([]);
  const [prikaziRezervacijePonude, setPrikaziRezervacijePonude] = useState(false);



  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [zahtjeviRes, rezervacijeRes, ponudeRes, odbijeneRes] = await Promise.all([
        axios.get(`${API_BASE}/zahtjevi-rezervacija`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/sve-rezervacije`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/ponude/moje`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/odbijene-rezervacije`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const ponude = ponudeRes.data;
      setDashboardStats({
        ukupnoZahtjeva: zahtjeviRes.data.length,
        prihvaceneRezervacije: rezervacijeRes.data.length,
        odbijeneRezervacije: odbijeneRes.data.length,
        aktivnePonude: ponude.filter(p => p.StatusPonude === 1).length,
        ponudeNaCekanju: ponude.filter(p => p.StatusPonude === 0).length
      });
    } catch (err) {
      console.error("Greška pri dohvatanju statistika:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchZahtjevi = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/zahtjevi-rezervacija`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setZahtjevi(res.data);
    } catch (err) {
      console.error("Greška zahtjevi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRezervacijePonude = async (idPonude) => {
  try {
    const res = await axios.get(`${API_BASE}/ponude/${idPonude}/rezervacije`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRezervacijePonude(res.data);
    setPrikaziRezervacijePonude(true);
  } catch (err) {
    console.error("Greška pri dohvatanju rezervacija ponude:", err);
    alert("Greška pri dohvatanju rezervacija.");
  }
};


  // Dohvati sve prihvaćene rezervacije
  const fetchRezervacije = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/sve-rezervacije`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRezervacije(res.data);
    } catch (err) {
      console.error("Greška rezervacije:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dohvati svoje ponude
  const fetchPonudeOdobrene = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ponude/moje-odobrene`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPonudeOdobrene(res.data);
    } catch (err) {
      console.error("Greška ponude:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPonudeNeodobrene = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ponude/moje-neodobrene`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPonudeNeodobrene(res.data);
    } catch (err) {
      console.error("Greška ponude:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dohvati profil agencije
  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfil(res.data.user);
    } catch (err) {
      console.error("Greška profil:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinacije = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/destinacije`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDestinacije(res.data);
    } catch (err) {
      console.error("Greška destinacije:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dohvatanje detalja jedne rezervacije
  const fetchZahtjevDetalji = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/zahtjevi-rezervacija/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOdabraniZahtjev(res.data);
    } catch (err) {
      console.error("Greška detalji zahtjeva:", err);
      alert("Greška pri dohvatanju detalja rezervacije.");
    } finally {
      setLoading(false);
    }
  };

  // Odgovor na rezervaciju (prihvatanje/odbijanje)
  const handleRezervacijaStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `${API_BASE}/zahtjevi-rezervacija/${id}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setOdabraniZahtjev(null); // vrati na listu
      fetchZahtjevi(); // ponovo ucitaj listu
    } catch (err) {
      console.error("Greška pri ažuriranju statusa:", err);
      alert("Greška pri ažuriranju statusa.");
    }
  };

  const fetchPonudaDetalji = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ponude/moje/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOdabranaPonuda(res.data);
      setPonudaForm(res.data); // popuni formu za edit
    } catch (err) {
      console.error("Greška detalji ponude:", err);
      alert("Greška pri dohvatanju detalja ponude.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRezervacijaDetalji = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/sve-rezervacije/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOdabranaRezervacija(res.data);
    } catch (err) {
      console.error("Greška detalji rezervacije:", err);
      alert("Greška pri dohvatanju detalja rezervacije.");
    }
  };

  const fetchProfilKorisnika = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfilKorisnika(res.data.user);
    } catch (err) {
      console.error("Greška profil korisnika:", err);
      alert("Greška pri dohvatanju profila korisnika.");
    }
  };

  const fetchOdbijeneRezervacije = async () => {
    try {
      const res = await axios.get(`${API_BASE}/odbijene-rezervacije`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOdbijeneRezervacije(res.data);
    } catch (err) {
      console.error("Greška odbijene rezervacije:", err);
    }
  };


  const handlePonudaChange = (e) => {
    const { name, value } = e.target;
    setPonudaForm({ ...ponudaForm, [name]: value });
  };

  const formatDateForMySQL = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleProfilChange = (e) => {
    const { name, value } = e.target;
    setProfilForm({ ...profilForm, [name]: value });
  };

  const handleUpdateProfil = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/edit-profile`,
        profilForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setEditMode(false);
      fetchProfil(); // refresh nakon izmjene
    } catch (err) {
      console.error("Greška izmjena profila:", err);
      alert(err.response?.data?.error || "Greška pri izmjeni profila.");
    }
  };

  const handleUpdatePonuda = async () => {
    try {
      // mapiraj frontend state (koji ima velika slova) na backend payload (mala slova)
      const payload = {
        cijena: ponudaForm.Cijena,
        opis: ponudaForm.Opis,
        datumPolaska: formatDateForMySQL(ponudaForm.DatumPolaska),
        datumPovratka: formatDateForMySQL(ponudaForm.DatumPovratka),
        tipPrevoza: ponudaForm.TipPrevoza,
        brojSlobodnihMjesta: ponudaForm.BrojSlobodnihMjesta,
        najatraktivnijaPonuda: ponudaForm.NajatraktivnijaPonuda,
        idDESTINACIJA: ponudaForm.idDESTINACIJA,
        statusPonude: ponudaForm.StatusPonude,
      };


      const res = await axios.put(
        `${API_BASE}/izmjenaponude/${odabranaPonuda.idPONUDA}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setEditMode(false);
      setOdabranaPonuda(null);
      fetchPonudeOdobrene(); 
      fetchPonudeNeodobrene(); 
    } catch (err) {
      console.error("Greška izmjena:", err);
      alert("Greška pri izmjeni ponude.");
    }
  };

  const handleDeletePonuda = async () => {
  if (!window.confirm("Da li ste sigurni da želite obrisati ovu ponudu?")) return;

  try {
    const res = await axios.delete(
      `${API_BASE}/obrisi-ponudu/${odabranaPonuda.idPONUDA}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(res.data.message);
    setOdabranaPonuda(null);
    fetchPonudeOdobrene();
    fetchPonudeNeodobrene();
  } catch (err) {
    console.error("Greška brisanje:", err);
    const poruka = err.response?.data?.error || "Greška pri brisanju ponude.";
    alert(poruka);
  }
};


  // Kreiranje nove ponude
  const handleCreatePonuda = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      cijena: form.cijena.value,
      opis: form.opis.value,
      datumPolaska: form.datumPolaska.value,
      datumPovratka: form.datumPovratka.value,
      tipPrevoza: form.tipPrevoza.value,
      brojSlobodnihMjesta: form.brojSlobodnihMjesta.value,
      najatraktivnijaPonuda: form.najatraktivnijaPonuda.checked,
      idDESTINACIJA: form.idDESTINACIJA.value,
    };

    try {
      await axios.post(`${API_BASE}/zahtjevi-ponuda`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Ponuda kreirana! Čeka odobrenje administratora.");
      form.reset();
      fetchPonudeOdobrene();
      fetchPonudeNeodobrene();
    } catch (err) {
      console.error("Greška kreiranja ponude:", err);
      alert("Greška pri kreiranju ponude.");
    }
  };

  useEffect(() => {
    fetchDestinacije();
  }, []);

  useEffect(() => {
    fetchProfil();
  }, []);

  useEffect(() => {
    if (activeSection === "dashboard") fetchDashboardStats();
  }, [activeSection]);

  const formatDatum = (datum) => {
    const d = new Date(datum);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

  const renderContent = () => {
    if (loading) return <p>⏳ Učitavanje...</p>;

    switch (activeSection) {
      case "requests":
        return (
          <div>
            <h2 className="agency-title">📋 Zahtjevi za rezervaciju</h2>
            {odabraniZahtjev ? (
              <div className="zahtjev-detalji">
                <ul>
                  <li><b>Korisnik:</b> {odabraniZahtjev.ImeKorisnika} {odabraniZahtjev.PrezimeKorisnika}</li>
                  <li><b>Email:</b> {odabraniZahtjev.Email}</li>
                  <li><b>Ponuda:</b> {odabraniZahtjev.NazivPonude}</li>
                  <li><b>Cijena po osobi:</b> {odabraniZahtjev.CijenaPoOsobi} BAM</li>
                  <li><b>Datum:</b> {new Date(odabraniZahtjev.Datum).toLocaleDateString()}</li>
                  <li><b>Broj odraslih:</b> {odabraniZahtjev.BrojOdraslih}</li>
                  <li><b>Broj djece:</b> {odabraniZahtjev.BrojDjece}</li>
                  <li><b>Status:</b> {odabraniZahtjev.StatusRezervacije}</li>
                </ul>

                <div className="zahtjev-akcije">
                  <button className="btn-accept" onClick={() => handleRezervacijaStatus(odabraniZahtjev.idREZERVACIJA, 1)}>
                    ✅ Prihvati
                  </button>
                  <button className="btn-reject" onClick={() => handleRezervacijaStatus(odabraniZahtjev.idREZERVACIJA, -1)}>
                    ❌ Odbij
                  </button>
                  <button className="btn-back" onClick={() => setOdabraniZahtjev(null)}>
                    ⬅ Nazad na listu
                  </button>
                </div>
              </div>
            ) : (
              <>
                {zahtjevi.length === 0 ? (
                  <p>Nema zahtjeva.</p>
                ) : (
                  <ul className="zahtjevi-lista">
                    {zahtjevi.map((z) => (
                      <li
                        key={z.idREZERVACIJA}
                        onClick={() => fetchZahtjevDetalji(z.idREZERVACIJA)}
                        className="zahtjev-item"
                      >
                        {z.ImeKorisnika} {z.PrezimeKorisnika} - {z.NazivPonude} ({new Date(z.Datum).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        );


      case "createOffer":
        return (
          <div>
            <h2 className="agency-title">➕ Kreiraj novu ponudu</h2>
            <form className="agency-form" onSubmit={handleCreatePonuda}>
              <input type="number" name="cijena" placeholder="Cijena (BAM)" required />
              <textarea name="opis" placeholder="Opis ponude" />
              <input type="date" name="datumPolaska" required />
              <input type="date" name="datumPovratka" required />

              <select name="tipPrevoza" required>
                <option value="">Odaberite tip prevoza</option>
                <option value="autobus">Autobus</option>
                <option value="avion">Avion</option>
                <option value="brod">Brod</option>
                <option value="voz">Voz</option>
                <option value="autobus+brod">Autobus + Brod</option>
                <option value="autobus+avion">Autobus + Avion</option>
                <option value="autobus+voz">Autobus + Voz</option>
                <option value="avion+voz">Avion + Voz</option>
                <option value="avion+brod">Avion + Brod</option>
                <option value="brod+voz">Brod + Voz</option>
              </select>


              <input type="number" name="brojSlobodnihMjesta" placeholder="Broj mjesta" required />
              <label>
                <input type="checkbox" name="najatraktivnijaPonuda" /> Najatraktivnija ponuda
              </label>
              <select name="idDESTINACIJA" required>
                <option value="">Odaberite destinaciju</option>
                {destinacije.map((d) => (
                  <option key={d.idDESTINACIJA} value={d.idDESTINACIJA}>
                    {d.Naziv}
                  </option>
                ))}
              </select>
              <button type="submit">Kreiraj ponudu</button>
            </form>
          </div>
        );

      case "reservations":
        return (
          <div>
            <h2 className="agency-title">📑 Lista prihvaćenih rezervacija</h2>

            {odabranaRezervacija ? (
              profilKorisnika ? (
                <div className="zahtjev-detalji">
                  <h3>👤 Profil korisnika</h3>
                  <ul>
                    <li><b>Ime:</b> {profilKorisnika.Ime}</li>
                    <li><b>Prezime:</b> {profilKorisnika.Prezime}</li>
                    <li><b>Email:</b> {profilKorisnika.Email}</li>
                    <li><b>Korisničko ime:</b> {profilKorisnika.KorisnickoIme}</li>
                    <li><b>Datum rođenja:</b> {formatDatum(profilKorisnika.DatumRodjenja)}</li>
                  </ul>
                  <div className="zahtjev-akcije">
                    <button className="btn-back" onClick={() => setProfilKorisnika(null)}>⬅ Nazad</button>
                  </div>
                </div>
              ) : (
                <div className="zahtjev-detalji">
                  <ul>
                    {/*<li><b>Rezervacija ID:</b> {odabranaRezervacija.idREZERVACIJA}</li>*/}
                    <li><b>Datum:</b> {new Date(odabranaRezervacija.Datum).toLocaleDateString()}</li>
                    <li><b>Odraslih:</b> {odabranaRezervacija.BrojOdraslih}</li>
                    <li><b>Djece:</b> {odabranaRezervacija.BrojDjece}</li>
                    <li><b>Status:</b> {odabranaRezervacija.StatusRezervacije}</li>
                    <li><b>Ponuda:</b> {odabranaRezervacija.NazivPonude}</li>
                    <li><b>Cijena po osobi:</b> {odabranaRezervacija.CijenaPoOsobi} BAM</li>
                    <li><b>Korisnik:</b> {odabranaRezervacija.ImeKorisnika} {odabranaRezervacija.PrezimeKorisnika}</li>
                  </ul>

                  <div className="zahtjev-akcije">
                    <button
                      className="btn-accept"
                      onClick={() => fetchProfilKorisnika(odabranaRezervacija.idKORISNIK)}
                    >
                      👤 Profil korisnika
                    </button>
                    <button className="btn-back" onClick={() => setOdabranaRezervacija(null)}>⬅ Nazad</button>
                  </div>
                </div>
              )
            ) : (
              <ul className="zahtjevi-lista">
                {rezervacije.length === 0 ? (
                  <p>Nema prihvaćenih rezervacija.</p>
                ) : (
                  rezervacije.map((r) => (
                    <li
                      key={r.idREZERVACIJA}
                      onClick={() => fetchRezervacijaDetalji(r.idREZERVACIJA)}
                      className="zahtjev-item"
                    >
                      {r.ImeKorisnika} {r.PrezimeKorisnika} - {r.NazivPonude} ({new Date(r.Datum).toLocaleDateString()})
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        );


      case "offers":
        return (
          <div>
            <h2 className="agency-title">📦 Moje ponude</h2>

            {odabranaPonuda ? (
              editMode ? (
                <div className="ponuda-edit-form">
                  <h3>Izmjena ponude</h3>
                  <input
                    type="text"
                    name="Opis"
                    value={ponudaForm.Opis || ""}
                    onChange={handlePonudaChange}
                    placeholder="Opis"
                  />
                  <input
                    type="number"
                    name="Cijena"
                    value={ponudaForm.Cijena || ""}
                    onChange={handlePonudaChange}
                    placeholder="Cijena"
                  />
                  <input
                    type="date"
                    name="DatumPolaska"
                    value={ponudaForm.DatumPolaska?.split("T")[0] || ""}
                    onChange={handlePonudaChange}
                  />
                  <input
                    type="date"
                    name="DatumPovratka"
                    value={ponudaForm.DatumPovratka?.split("T")[0] || ""}
                    onChange={handlePonudaChange}
                  />
                  <input
                    type="text"
                    name="TipPrevoza"
                    value={ponudaForm.TipPrevoza || ""}
                    onChange={handlePonudaChange}
                    placeholder="Tip prevoza"
                  />
                  <input
                    type="number"
                    name="BrojSlobodnihMjesta"
                    value={ponudaForm.BrojSlobodnihMjesta || ""}
                    onChange={handlePonudaChange}
                    placeholder="Broj slobodnih mjesta"
                  />
                  <label>
                    Najatraktivnija ponuda:
                    <input
                      type="checkbox"
                      checked={ponudaForm.NajatraktivnijaPonuda === 1}
                      onChange={(e) =>
                        setPonudaForm({
                          ...ponudaForm,
                          NajatraktivnijaPonuda: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                  </label>
                  <label>
                    Status ponude:
                    <select
                      name="StatusPonude"
                      value={ponudaForm.StatusPonude ?? 1}
                      onChange={handlePonudaChange}
                    >
                      <option value={1}>✅ Aktivna</option>
                      <option value={0}>⏳ Na čekanju</option>
                      <option value={-1}>🚫 Privremeno uklonjena</option>
                    </select>
                  </label>

                  <button onClick={handleUpdatePonuda}>💾 Sačuvaj</button>
                  <button onClick={() => setEditMode(false)}>⬅ Nazad</button>
                </div>

              ) : (
                <div className="ponuda-detalji">
                  <h3>{odabranaPonuda.Opis}</h3>
                  <p><b>Cijena:</b> {odabranaPonuda.Cijena} BAM</p>
                  <p><b>Destinacija:</b> {odabranaPonuda.NazivDestinacije}</p>
                  <p><b>Opis destinacije:</b> {odabranaPonuda.Opis}</p>
                  <p><b>Tip:</b> {odabranaPonuda.Tip}</p>
                  <p><b>Polazak:</b> {new Date(odabranaPonuda.DatumPolaska).toLocaleDateString()}</p>
                  <p><b>Povratak:</b> {new Date(odabranaPonuda.DatumPovratka).toLocaleDateString()}</p>
                  <p><b>Prevoz:</b> {odabranaPonuda.TipPrevoza}</p>
                  <p><b>Slobodnih mjesta:</b> {odabranaPonuda.BrojSlobodnihMjesta}</p>

                  <div className="ponuda-akcije">
                    <button onClick={() => setEditMode(true)}>✏️ Izmijeni</button>
                    <button onClick={handleDeletePonuda}>🗑️ Obriši</button>
                    <button onClick={() => fetchRezervacijePonude(odabranaPonuda.idPONUDA)}>📑 Rezervacije</button>
                    <button onClick={() => setOdabranaPonuda(null)}>⬅ Nazad</button>
                  </div>

                                {prikaziRezervacijePonude && (
                  <div className="rezervacije-ponude">
                    <h4>📋 Rezervacije za ovu ponudu</h4>
                    {rezervacijePonude.length === 0 ? (
                      <p>Nema rezervacija za ovu ponudu.</p>
                    ) : (
                      <ul className="zahtjevi-lista">
                        {rezervacijePonude.map((r) => (
                          <li key={r.idREZERVACIJA} className="zahtjev-item">
                            {r.ImeKorisnika} {r.PrezimeKorisnika} - {r.Email} <br />
                            {r.BrojOdraslih} odraslih, {r.BrojDjece} djece | 
                            Datum: {new Date(r.Datum).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="btn-back" onClick={() => setPrikaziRezervacijePonude(false)}>⬅ Sakrij</button>
                  </div>
                )}

                </div>
              )
            ) : (
              <ul className="ponude-lista">
                {ponudeOdobrene.length === 0 ? (
                  <p>Nema ponuda.</p>
                ) : (
                  ponudeOdobrene.map((p) => (
                    <li
                      key={p.idPONUDA}
                      onClick={() => fetchPonudaDetalji(p.idPONUDA)}
                      className="ponuda-item"
                    >
                      {p.Opis} ({p.Cijena}BAM)
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        );

        case "unauthorized":
        return (
          <div>
            <h2 className="agency-title">📦 Ponude na čekanju</h2>

            {odabranaPonuda ? (
              editMode ? (
                <div className="ponuda-edit-form">
                  <h3>Izmjena ponude</h3>
                  <input
                    type="text"
                    name="Opis"
                    value={ponudaForm.Opis || ""}
                    onChange={handlePonudaChange}
                    placeholder="Opis"
                  />
                  <input
                    type="number"
                    name="Cijena"
                    value={ponudaForm.Cijena || ""}
                    onChange={handlePonudaChange}
                    placeholder="Cijena"
                  />
                  <input
                    type="date"
                    name="DatumPolaska"
                    value={ponudaForm.DatumPolaska?.split("T")[0] || ""}
                    onChange={handlePonudaChange}
                  />
                  <input
                    type="date"
                    name="DatumPovratka"
                    value={ponudaForm.DatumPovratka?.split("T")[0] || ""}
                    onChange={handlePonudaChange}
                  />
                  <input
                    type="text"
                    name="TipPrevoza"
                    value={ponudaForm.TipPrevoza || ""}
                    onChange={handlePonudaChange}
                    placeholder="Tip prevoza"
                  />
                  <input
                    type="number"
                    name="BrojSlobodnihMjesta"
                    value={ponudaForm.BrojSlobodnihMjesta || ""}
                    onChange={handlePonudaChange}
                    placeholder="Broj slobodnih mjesta"
                  />
                  <label>
                    Najatraktivnija ponuda:
                    <input
                      type="checkbox"
                      checked={ponudaForm.NajatraktivnijaPonuda === 1}
                      onChange={(e) =>
                        setPonudaForm({
                          ...ponudaForm,
                          NajatraktivnijaPonuda: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                  </label>
                  <button onClick={handleUpdatePonuda}>💾 Sačuvaj</button>
                  <button onClick={() => setEditMode(false)}>⬅ Nazad</button>
                </div>

              ) : (
                <div className="ponuda-detalji">
                  <h3>{odabranaPonuda.Opis}</h3>
                  <p><b>Cijena:</b> {odabranaPonuda.Cijena} BAM</p>
                  <p><b>Destinacija:</b> {odabranaPonuda.NazivDestinacije}</p>
                  <p><b>Opis destinacije:</b> {odabranaPonuda.Opis}</p>
                  <p><b>Tip:</b> {odabranaPonuda.Tip}</p>
                  <p><b>Polazak:</b> {new Date(odabranaPonuda.DatumPolaska).toLocaleDateString()}</p>
                  <p><b>Povratak:</b> {new Date(odabranaPonuda.DatumPovratka).toLocaleDateString()}</p>
                  <p><b>Prevoz:</b> {odabranaPonuda.TipPrevoza}</p>
                  <p><b>Slobodnih mjesta:</b> {odabranaPonuda.BrojSlobodnihMjesta}</p>

                  <div className="ponuda-akcije">
                    <button onClick={() => setEditMode(true)}>✏️ Izmijeni</button>
                    <button onClick={handleDeletePonuda}>🗑️ Obriši</button>
                    <button onClick={() => setOdabranaPonuda(null)}>⬅ Nazad</button>
                  </div>
                </div>
              )
            ) : (
              <ul className="ponude-lista">
                {ponudeNeodobrene.length === 0 ? (
                  <p>Nema ponuda.</p>
                ) : (
                  ponudeNeodobrene.map((p) => (
                    <li
                      key={p.idPONUDA}
                      onClick={() => fetchPonudaDetalji(p.idPONUDA)}
                      className="ponuda-item"
                    >
                      {p.Opis} ({p.Cijena}BAM)
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        );


      case "profile":
        return (
          <div>
            <h2 className="agency-title">👤 Moj profil</h2>
            {profil ? (
              editMode ? (
                <div className="profil-edit-form">
                  <h3>Izmjena profila</h3>
                  <input
                    type="text"
                    name="NazivAgencije"
                    value={profilForm.NazivAgencije || ""}
                    onChange={handleProfilChange}
                    placeholder="Naziv agencije"
                  />
                  <input
                    type="email"
                    name="Email"
                    value={profilForm.Email || ""}
                    onChange={handleProfilChange}
                    placeholder="Email"
                  />

                  <h4 style={{ marginTop: "15px" }}>Promjena lozinke</h4>
                  <input
                    type="password"
                    name="StaraLozinka"
                    value={profilForm.StaraLozinka || ""}
                    onChange={handleProfilChange}
                    placeholder="Stara lozinka"
                  />
                  <input
                    type="password"
                    name="NovaLozinka"
                    value={profilForm.NovaLozinka || ""}
                    onChange={handleProfilChange}
                    placeholder="Nova lozinka"
                  />

                  <button onClick={handleUpdateProfil}>💾 Sačuvaj</button>
                  <button onClick={() => setEditMode(false)}>⬅ Nazad</button>
                </div>
              ) : (
                <div className="profil-detalji">
                  <ul>
                    <li>Naziv agencije: {profil.NazivAgencije}</li>
                    <li>Email: {profil.Email}</li>
                    <li>Korisničko ime: {profil.KorisnickoIme}</li>
                  </ul>
                  <div className="profil-akcije">
                    <button onClick={() => {
                      setProfilForm(profil);
                      setEditMode(true);
                    }}>
                      ✏️ Izmijeni
                    </button>
                  </div>
                </div>
              )
            ) : (
              <p>Greška pri učitavanju profila.</p>
            )}
          </div>
        );


      case "destinations":
        return (
          <div>
            <h2 className="agency-title">🌍 Destinacije</h2>
            {destinacije.length === 0 ? (
              <p>Nema dostupnih destinacija.</p>
            ) : (
              <table className="dest-table">
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th>Opis</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {destinacije.map((d) => (
                    <tr key={d.idDESTINACIJA}>
                      <td>{d.Naziv}</td>
                      <td>{d.Opis}</td>
                      <td>{d.Tip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case "rejected":
        return (
          <div>
            <h2 className="agency-title">❌ Odbijene rezervacije</h2>
            {odbijeneRezervacije.length === 0 ? (
              <p>Nema odbijenih rezervacija.</p>
            ) : (
              <ul className="zahtjevi-lista">
                {odbijeneRezervacije.map((r) => (
                  <li key={r.idREZERVACIJA} className="zahtjev-item">
                    {r.ImeKorisnika} {r.PrezimeKorisnika} - {r.NazivPonude} (
                    {new Date(r.Datum).toLocaleDateString()}) |{" "}
                    <b>Status:</b>{" "}
                    {r.StatusRezervacije === -1 ? "Odbijena" : r.StatusRezervacije}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );



      case "dashboard":
        return (
          <div className="dashboard-overview">
            <h2 className="agency-title">
              Dobrodošli{profil?.NazivAgencije ? `,  ${profil.NazivAgencije}` : ""} 
            </h2>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{dashboardStats.ukupnoZahtjeva}</div>
                <div className="stat-label">Novi zahtjevi</div>
                <button onClick={() => setActiveSection("requests")} className="stat-button">
                  Pogledaj
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-number">{dashboardStats.prihvaceneRezervacije}</div>
                <div className="stat-label">Prihvaćene rezervacije</div>
                <button onClick={() => setActiveSection("reservations")} className="stat-button">
                  Pogledaj
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-number">{dashboardStats.odbijeneRezervacije}</div>
                <div className="stat-label">Odbijene rezervacije</div>
                <button onClick={() => setActiveSection("rejected")} className="stat-button">
                  Pogledaj
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-number">{dashboardStats.aktivnePonude}</div>
                <div className="stat-label">Odobrene ponude</div>
                <button onClick={() => setActiveSection("offers")} className="stat-button">
                  Pogledaj
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-number">{dashboardStats.ponudeNaCekanju}</div>
                <div className="stat-label">Ponude na čekanju</div>
                <button onClick={() => setActiveSection("unauthorized")} className="stat-button">
                  Pogledaj
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-number">{destinacije.length}</div>
                <div className="stat-label">Dostupne destinacije</div>
                <button onClick={() => setActiveSection("destinations")} className="stat-button">
                  Pogledaj
                </button>
              </div>
            </div>
          </div>
        );

    }
  };

  // Kad promijenimo sekciju, automatski povuci podatke
  useEffect(() => {
    if (activeSection === "requests") fetchZahtjevi();
    if (activeSection === "reservations") fetchRezervacije();
    if (activeSection === "offers") fetchPonudeOdobrene();
    if (activeSection === "unauthorized") fetchPonudeNeodobrene();
    if (activeSection === "profile") fetchProfil();
    if (activeSection === "destinations") fetchDestinacije();
    if (activeSection === "rejected") fetchOdbijeneRezervacije();
  }, [activeSection]);

  return (
    <div className="agency-home">

      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={activeSection === "dashboard" ? "active" : ""}
          >
            Dashboard
          </button>
          <button onClick={() => setActiveSection("profile")}>
            Moj profil
          </button>
          <button onClick={() => setActiveSection("requests")}>
            Zahtjevi za rezervaciju
          </button>
          <button onClick={() => setActiveSection("reservations")}>
            Lista rezervacija
          </button>
          <button onClick={() => { setActiveSection("rejected") }}>
            Odbijene rezervacije
          </button>
          <button onClick={() => setActiveSection("offers")}>
            Odobrene ponude
          </button>
          <button onClick={() => setActiveSection("unauthorized")}>
            Ponude na čekanju
          </button>
          <button onClick={() => setActiveSection("createOffer")}>
            Kreiraj ponudu
          </button>
          <button onClick={() => setActiveSection("destinations")}>
            Destinacije
          </button>
          <button onClick={() => navigate("/reportproblem")}>
            Prijava problema
          </button>

        </div>

        {/* Glavni sadržaj */}
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AgencyHome;
