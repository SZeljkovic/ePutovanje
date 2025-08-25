import React, { useState, useEffect } from "react";
import "./CompareOffers.css";

const CompareOffers = () => {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/ponude", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        setError("Greška pri učitavanju ponuda.");
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      if (selected.length === 2) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:5000/ponude/uporedi?id1=${selected[0]}&id2=${selected[1]}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          setComparison(data);
        } catch (err) {
          setError("Greška pri upoređivanju ponuda.");
        }
      }
    };
    fetchComparison();
  }, [selected]);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
      setComparison(null);
    } else if (selected.length < 2) {
      setSelected([...selected, id]);
    }
  };

  const highlightClass = (val1, val2) => {
    return val1 !== val2 ? "different" : "";
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Poredi ponude</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="compare-layout">
        {/* --- Lijevo: Lista ponuda --- */}
        <div className="offers-grid">
          {offers.map((offer) => (
            <div
              key={offer.idPONUDA}
              className={`offer-card ${
                selected.includes(offer.idPONUDA) ? "selected" : ""
              }`}
              onClick={() => toggleSelect(offer.idPONUDA)}
            >
              <h3 className="font-semibold">{offer.Opis}</h3>
              <p className="text-sm">
                Destinacije:{" "}
                {offer.Destinacije.map((d) => d.Naziv).join(", ")}
              </p>
              <p className="text-sm">Cijena: {offer.Cijena} KM</p>
              <p className="text-sm">Polazak: {formatDate(offer.DatumPolaska)}</p>
            </div>
          ))}
        </div>

        {/* --- Desno: Tabela poređenja --- */}
        <div className="comparison-table-wrapper">
          {comparison ? (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Atribut</th>
                  <th>Ponuda 1</th>
                  <th>Ponuda 2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Destinacije</td>
                  <td
                    className={highlightClass(
                      comparison.ponuda1.Destinacije.map((d) => d.Naziv).join(", "),
                      comparison.ponuda2.Destinacije.map((d) => d.Naziv).join(", ")
                    )}
                  >
                    {comparison.ponuda1.Destinacije.map((d) => d.Naziv).join(", ")}
                  </td>
                  <td
                    className={highlightClass(
                      comparison.ponuda2.Destinacije.map((d) => d.Naziv).join(", "),
                      comparison.ponuda1.Destinacije.map((d) => d.Naziv).join(", ")
                    )}
                  >
                    {comparison.ponuda2.Destinacije.map((d) => d.Naziv).join(", ")}
                  </td>
                </tr>

                <tr>
                  <td>Cijena</td>
                  <td className={highlightClass(comparison.ponuda1.Cijena, comparison.ponuda2.Cijena)}>
                    {comparison.ponuda1.Cijena} KM
                  </td>
                  <td className={highlightClass(comparison.ponuda2.Cijena, comparison.ponuda1.Cijena)}>
                    {comparison.ponuda2.Cijena} KM
                  </td>
                </tr>

                <tr>
                  <td>Polazak</td>
                  <td className={highlightClass(comparison.ponuda1.DatumPolaska, comparison.ponuda2.DatumPolaska)}>
                    {formatDate(comparison.ponuda1.DatumPolaska)}
                  </td>
                  <td className={highlightClass(comparison.ponuda2.DatumPolaska, comparison.ponuda1.DatumPolaska)}>
                     {formatDate(comparison.ponuda2.DatumPolaska)}
                  </td>
                </tr>

                <tr>
                  <td>Povratak</td>
                  <td className={highlightClass(comparison.ponuda1.DatumPovratka, comparison.ponuda2.DatumPovratka)}>
                    {formatDate(comparison.ponuda1.DatumPovratka)}
                  </td>
                  <td className={highlightClass(comparison.ponuda2.DatumPovratka, comparison.ponuda1.DatumPovratka)}>
                    {formatDate(comparison.ponuda2.DatumPovratka)}
                  </td>
                </tr>

                <tr>
                  <td>Tip prevoza</td>
                  <td className={highlightClass(comparison.ponuda1.TipPrevoza, comparison.ponuda2.TipPrevoza)}>
                    {comparison.ponuda1.TipPrevoza}
                  </td>
                  <td className={highlightClass(comparison.ponuda2.TipPrevoza, comparison.ponuda1.TipPrevoza)}>
                    {comparison.ponuda2.TipPrevoza}
                  </td>
                </tr>

                <tr>
                  <td>Slobodna mjesta</td>
                  <td
                    className={highlightClass(
                      comparison.ponuda1.BrojSlobodnihMjesta,
                      comparison.ponuda2.BrojSlobodnihMjesta
                    )}
                  >
                    {comparison.ponuda1.BrojSlobodnihMjesta}
                  </td>
                  <td
                    className={highlightClass(
                      comparison.ponuda2.BrojSlobodnihMjesta,
                      comparison.ponuda1.BrojSlobodnihMjesta
                    )}
                  >
                    {comparison.ponuda2.BrojSlobodnihMjesta}
                  </td>
                </tr>

                <tr>
                  <td>Opis</td>
                  <td className={highlightClass(comparison.ponuda1.Opis, comparison.ponuda2.Opis)}>
                    {comparison.ponuda1.Opis}
                  </td>
                  <td className={highlightClass(comparison.ponuda2.Opis, comparison.ponuda1.Opis)}>
                    {comparison.ponuda2.Opis}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">
              Odaberi dvije ponude za poređenje.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareOffers;
