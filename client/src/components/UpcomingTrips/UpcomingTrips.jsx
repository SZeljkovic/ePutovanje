import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingTrips.css';


const getDestinationImage = (destinationName) => {
  if (!destinationName) {
    return '/assets/default.jpg';
  }

  const lowercaseName = destinationName.toLowerCase();
  const formats = ['.jpg', '.png', '.jpeg', '.webp'];

  for (const format of formats) {
    try {
      const imagePath = `/assets/${lowercaseName}${format}`;
      return imagePath;
    } catch (err) {
      continue;
    }
  }

  console.error(`Slika za destinaciju "${destinationName}" nije pronađena.`);
  return '/assets/default.jpg';
};

const UpcomingTrips = ({ searchQuery }) => {
  const [sortOrder, setSortOrder] = useState('default');
  const [trips, setTrips] = useState([]);
  const [originalTrips, setOriginalTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const tripsSectionRef = useRef(null);

  const loadRatingForOffer = async (idPONUDA) => {
    try {
      const res = await axios.get(`http://localhost:5000/ponuda/${idPONUDA}/ocjena`);
      const rating = res.data.averageRating;
      const numericRating = parseFloat(rating);
      const validRating = typeof numericRating === 'number' && numericRating >= 0 && numericRating <= 5 ? numericRating : 0;
      console.log(`Ocjena za ponudu ${idPONUDA}:`, validRating);
      return validRating;
    } catch (err) {
      console.error(`Greška pri učitavanju ocjene za ponudu ${idPONUDA}:`, err.response?.data || err.message);
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
          destinations: ponuda.Destinacije,
          rawDepartureDate: new Date(ponuda.DatumPolaska),
          rawReturnDate: new Date(ponuda.DatumPovratka),
          korisnickoImeAgencije: ponuda.KorisnickoIme
        };
      }));

      setTrips(transformedTrips);
      setOriginalTrips(transformedTrips);
      setError(null);
    } catch (err) {
      console.error("Greška pri učitavanju ponuda:", err);
      setError("Greška pri učitavanju svih ponuda.");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    if (originalTrips.length > 0) {
      if (!searchQuery || (!searchQuery.destination && !searchQuery.departureDate && !searchQuery.returnDate && !searchQuery.budget)) {
        setTrips(originalTrips);
      } else {
        handleFilter(searchQuery);
      }
    }
  }, [searchQuery, originalTrips]);

  useEffect(() => {
    if (searchQuery && tripsSectionRef.current) {
      tripsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleFilter = (searchData) => {
    if (!searchData || (!searchData.destination && !searchData.departureDate && !searchData.returnDate && !searchData.budget)) {
      setTrips(originalTrips);
      return;
    }

    const filteredTrips = originalTrips.filter(trip => {
      const matchesDestination = searchData.destination ?
        trip.destinations.some(dest =>
          dest.Naziv.toLowerCase().includes(searchData.destination.toLowerCase())
        ) : true;

      const matchesDepartureDate = searchData.departureDate ?
        trip.rawDepartureDate.toISOString().split('T')[0] >= searchData.departureDate : true;

      const matchesReturnDate = searchData.returnDate ?
        trip.rawReturnDate.toISOString().split('T')[0] <= searchData.returnDate : true;

      const matchesBudget = searchData.budget ?
        trip.currentPrice <= parseFloat(searchData.budget) : true;

      return matchesDestination && matchesDepartureDate && matchesReturnDate && matchesBudget;
    });

    setTrips(filteredTrips);
  };

  const handleResetFilters = () => {
    setTrips(originalTrips);
    setSortOrder('default');
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
    <section className="upcoming-trips" ref={tripsSectionRef}>
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
                      e.currentTarget.src = '/assets/default.jpg';
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
                    {trip.spotsLeft <= 10 && trip.spotsLeft > 0 && (
                      <span className="spots-left">
                        {trip.spotsLeft === 1
                          ? 'Posljednje'
                          : (trip.spotsLeft >= 2 && trip.spotsLeft <= 4)
                            ? 'Posljednja'
                            : 'Posljednjih'}{' '}
                        {trip.spotsLeft}{' '}
                        {trip.spotsLeft === 1
                          ? 'mjesto'
                          : (trip.spotsLeft >= 2 && trip.spotsLeft <= 4)
                            ? 'mjesta'
                            : 'mjesta'}
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
                      const token = localStorage.getItem("token");
                      if (token) {
                        navigate(`/offerdetails/${trip.id}`);
                      } else {
                        navigate("/login");
                      }
                    }}
                  >
                    Pogledaj
                  </button>
                  {/*<button
                    className="btn-save"
                    onClick={() => {
                      console.log('Sačuvaj ponudu:', trip.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>*/}
                  <button
                    className="btn-share"
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      if (token) {
                        navigate(`/inbox`, {
                          state: { korisnickoImePrimaoca: trip.korisnickoImeAgencije }
                        });
                      } else {
                        navigate("/login");
                      }
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