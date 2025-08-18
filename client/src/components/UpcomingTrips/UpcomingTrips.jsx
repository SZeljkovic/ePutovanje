import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingTrips.css';

const UpcomingTrips = () => {
  const [sortOrder, setSortOrder] = useState('default');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadRatingForOffer = async (idPONUDA) => {
    try {
      const res = await axios.get(`http://localhost:5000/ponuda/${idPONUDA}/ocjena`);
      const rating = res.data.averageRating || 0;
      console.log(`Ocjena za ponudu ${idPONUDA}:`, rating, typeof rating); 
      return rating;
    } catch (err) {
      console.error(`Greška pri učitavanju ocjene za ponudu ${idPONUDA}:`, err);
      return 0;
    }
  };

  const loadAllOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/ponude");

      const transformedTrips = await Promise.all(res.data.map(async ponuda => {
        const startDate = new Date(ponuda.DatumPolaska);
        const endDate = new Date(ponuda.DatumPovratka);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        const formatDate = (date) => {
          return new Date(date).toLocaleDateString('bs-BA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '. ');
        };

        const destinationNames = ponuda.Destinacije.map(dest => dest.Naziv).join(', ');
        const title = `${destinationNames} iz Banjaluke`;

        const avgRating = await loadRatingForOffer(ponuda.idPONUDA);

        return {
          id: ponuda.idPONUDA,
          title: title,
          departure: formatDate(ponuda.DatumPolaska),
          return: formatDate(ponuda.DatumPovratka),
          days: days,
          currentPrice: ponuda.Cijena,
          rating: avgRating,
          image: getDestinationImage(ponuda.Destinacije[0]?.Naziv),
          spotsLeft: ponuda.BrojSlobodnihMjesta,
          deal: ponuda.NajatraktivnijaPonuda,
          description: ponuda.Opis,
          transportType: ponuda.TipPrevoza,
          destinations: ponuda.Destinacije
        };
      }));

      setTrips(transformedTrips);
      setError(null);
    } catch (err) {
      console.error("Greška pri učitavanju ponuda:", err);
      setError("Greška pri učitavanju svih ponuda.");
    } finally {
      setLoading(false);
    }
  };


  const getDestinationImage = (destinationName) => {
    if (!destinationName) return '/assets/default.jpg';

    const name = destinationName.toLowerCase();
    if (name.includes('maldiv')) return '/assets/maldives.jpg';
    if (name.includes('dubai')) return '/assets/dubai.jpg';
    if (name.includes('mauricijus') || name.includes('mauritius')) return '/assets/mauritius.jpg';
    if (name.includes('kipar') || name.includes('cyprus')) return '/assets/cyprus.jpg';

    return '/assets/default.jpg';
  };


  const getSortedTrips = () => {
    const sortedTrips = [...trips];

    switch (sortOrder) {
      case 'price':
        return sortedTrips.sort((a, b) => a.currentPrice - b.currentPrice);
      case 'date':
        return sortedTrips.sort((a, b) => new Date(a.departure.split('. ').reverse().join('-')) - new Date(b.departure.split('. ').reverse().join('-')));
      case 'rating':
        return sortedTrips.sort((a, b) => b.rating - a.rating);
      case 'default':
      default:
        return sortedTrips.sort((a, b) => a.spotsLeft - b.spotsLeft);
    }
  };

  useEffect(() => {
    loadAllOffers();
  }, []);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  if (loading) {
    return (
      <section className="upcoming-trips">
        <div className="container">
          <div className="loading-state">
            <p>Učitavanje ponuda...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="upcoming-trips">
        <div className="container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadAllOffers} className="retry-button">
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (trips.length === 0) {
    return (
      <section className="upcoming-trips">
        <div className="container">
          <div className="empty-state">
            <p>Trenutno nema dostupnih ponuda.</p>
          </div>
        </div>
      </section>
    );
  }

  const sortedTrips = getSortedTrips();

  return (
    <section className="upcoming-trips">
      <div className="container">
        <div className="section-header">
          <h2>Predstojeća putovanja</h2>
          <div className="sort-dropdown">
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="default">Posljednja mjesta</option>
              <option value="price">Cijena</option>
              <option value="date">Datum</option>
              <option value="rating">Ocjena</option>
            </select>
          </div>
        </div>

        <div className="trips-grid">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              className={`trip-card ${trip.deal ? 'deal-card' : ''}`}
            >
              {trip.deal && <div className="deal-badge">DEAL</div>}

              <div className="trip-info">
                <div className="trip-dates">
                  <div className="date-column">
                    <span className="date-label">Polazak</span>
                    <span className="date-value">{trip.departure}</span>
                  </div>
                  <div className="date-column">
                    <span className="date-label">Dolazak</span>
                    <span className="date-value">{trip.return}</span>
                  </div>
                  <div className="date-column">
                    <span className="date-label">Dana</span>
                    <span className="date-value">{trip.days}</span>
                  </div>
                </div>

                <div className="trip-image">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    onError={(e) => {
                      e.target.src = '/assets/default.jpg';
                    }}
                  />
                </div>

                <div className="trip-details">
                  <h3>{trip.title}</h3>
                  <div className="rating">
                    {[...Array(5)].map((_, index) => {
                      const numericRating = Number(trip.rating) || 0;
                      return (
                        <span
                          key={index}
                          className={`star ${(index + 1) <= numericRating ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      );
                    })}
                    {trip.rating > 0 && (
                      <span className="rating-value">{trip.rating}</span>
                    )}
                    {trip.spotsLeft <= 10 && (
                      <span className="spots-left">
                        Posljednja {trip.spotsLeft} {trip.spotsLeft === 1 ? 'mjesto' : 'mjesta'}
                      </span>
                    )}
                  </div>

                </div>

                <div className="trip-pricing">
                  <div className="price-column">
                    <span className="price-label">cijena od</span>
                    <div className="price-row">
                      <span className="current-price">{trip.currentPrice.toLocaleString()}</span>
                      <span className="currency">BAM</span>
                    </div>
                  </div>
                </div>


                <div className="trip-actions">
                  <button
                    className="btn-view"
                    onClick={() => {
                      console.log('Pogledaj ponudu:', trip.id);
                    }}
                  >
                    Pogledaj
                  </button>
                  <button
                    className="btn-save"
                    onClick={() => {
                      console.log('Sačuvaj ponudu:', trip.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <button
                    className="btn-share"
                    onClick={() => {
                      navigate('/inbox');
                    }}
                  >
                    Upit
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;