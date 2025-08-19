import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import axios from "axios";
import "./AgencyHome.css";

const API_BASE = "http://localhost:5000"; // prilagodi port ako je drugi

const AgencyHome = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [zahtjevi, setZahtjevi] = useState([]);
  const [rezervacije, setRezervacije] = useState([]);
  const [ponude, setPonude] = useState([]);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destinacije, setDestinacije] = useState([]);
  const [odabraniZahtjev, setOdabraniZahtjev] = useState(null);
  const [odabranaPonuda, setOdabranaPonuda] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [ponudaForm, setPonudaForm] = useState({});


  const token = localStorage.getItem("token");

  // Dohvati zahtjeve za rezervaciju
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
  const fetchPonude = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ponude/moje`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPonude(res.data);
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
};


    const res = await axios.put(
      `${API_BASE}/izmjenaponude/${odabranaPonuda.idPONUDA}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(res.data.message);
    setEditMode(false);
    setOdabranaPonuda(null);
    fetchPonude(); // refresh liste
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
    fetchPonude();
  } catch (err) {
    console.error("Greška brisanje:", err);
    alert("Greška pri brisanju ponude.");
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
      fetchPonude();
    } catch (err) {
      console.error("Greška kreiranja ponude:", err);
      alert("Greška pri kreiranju ponude.");
    }
  };

  const renderContent = () => {
    if (loading) return <p>⏳ Učitavanje...</p>;

    switch (activeSection) {
      case "requests":
  return (
    <div>
      <h2>📋 Zahtjevi za rezervaciju</h2>
      {odabraniZahtjev ? (
        <div className="zahtjev-detalji">
          <h3>Detalji rezervacije</h3>
          <ul>
            <li><b>Korisnik:</b> {odabraniZahtjev.ImeKorisnika} {odabraniZahtjev.PrezimeKorisnika}</li>
            <li><b>Email:</b> {odabraniZahtjev.Email}</li>
            <li><b>Ponuda:</b> {odabraniZahtjev.NazivPonude}</li>
            <li><b>Cijena po osobi:</b> {odabraniZahtjev.CijenaPoOsobi} €</li>
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
            <h2>➕ Kreiraj novu ponudu</h2>
            <form className="agency-form" onSubmit={handleCreatePonuda}>
              <input type="number" name="cijena" placeholder="Cijena (€)" required />
              <textarea name="opis" placeholder="Opis ponude" />
              <input type="date" name="datumPolaska" required />
              <input type="date" name="datumPovratka" required />
              <input type="text" name="tipPrevoza" placeholder="Tip prevoza" required />
              <input type="number" name="brojSlobodnihMjesta" placeholder="Broj mjesta" required />
              <label>
                <input type="checkbox" name="najatraktivnijaPonuda" /> Najatraktivnija ponuda
              </label>
              <input type="number" name="idDESTINACIJA" placeholder="ID destinacije" required />
              <button type="submit">Kreiraj ponudu</button>
            </form>
          </div>
        );

      case "reservations":
        return (
          <div>
            <h2>📑 Lista prihvaćenih rezervacija</h2>
            {rezervacije.length === 0 ? (
              <p>Nema prihvaćenih rezervacija.</p>
            ) : (
              <ul>
                {rezervacije.map((r) => (
                  <li key={r.idREZERVACIJA}>
                    {r.ImeKorisnika} {r.PrezimeKorisnika} - {r.NazivPonude} (
                    {r.Datum})
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "archive":
  return (
    <div>
      <h2>📦 Moje ponude</h2>

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
            <p><b>Cijena:</b> {odabranaPonuda.Cijena} €</p>
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
          {ponude.length === 0 ? (
            <p>Nema ponuda.</p>
          ) : (
            ponude.map((p) => (
              <li
                key={p.idPONUDA}
                onClick={() => fetchPonudaDetalji(p.idPONUDA)}
                className="ponuda-item"
              >
                #{p.idPONUDA} - {p.Opis} ({p.Cijena}€)
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
            <h2>👤 Moj profil</h2>
            {profil ? (
              <ul>
                <li>Ime: {profil.Ime}</li>
                <li>Prezime: {profil.Prezime}</li>
                <li>Naziv agencije: {profil.NazivAgencije}</li>
                <li>Email: {profil.Email}</li>
                <li>Korisničko ime: {profil.KorisnickoIme}</li>
              </ul>
            ) : (
              <p>Greška pri učitavanju profila.</p>
            )}
          </div>
        );

        case "destinations":
        return (
          <div>
            <h2>🌍 Destinacije</h2>
            {destinacije.length === 0 ? (
              <p>Nema dostupnih destinacija.</p>
            ) : (
              <table className="dest-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Naziv</th>
                    <th>Opis</th>
                    <th>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {destinacije.map((d) => (
                    <tr key={d.idDESTINACIJA}>
                      <td>{d.idDESTINACIJA}</td>
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


      default:
        return <h2>Dobrodošli na dashboard 👋</h2>;
    }
  };

  // Kad promijenimo sekciju, automatski povuci podatke
  useEffect(() => {
    if (activeSection === "requests") fetchZahtjevi();
    if (activeSection === "reservations") fetchRezervacije();
    if (activeSection === "archive") fetchPonude();
    if (activeSection === "profile") fetchProfil();
    if (activeSection === "destinations") fetchDestinacije();
  }, [activeSection]);

  return (
    <div className="agency-home">
      
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <button onClick={() => setActiveSection("requests")}>
            Zahtjevi za rezervaciju
          </button>
          <button onClick={() => setActiveSection("createOffer")}>
            Kreiraj ponudu
          </button>
          <button onClick={() => setActiveSection("reservations")}>
            Lista rezervacija
          </button>
          <button onClick={() => setActiveSection("archive")}>
            Arhiva ponuda
          </button>
          <button onClick={() => setActiveSection("profile")}>
            Profil agencije
          </button>
          <button onClick={() => setActiveSection("destinations")}>
            Destinacije
          </button>
        </div>

        {/* Glavni sadržaj */}
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AgencyHome;
