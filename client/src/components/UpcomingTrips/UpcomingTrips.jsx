import React, { useState } from 'react';
import './UpcomingTrips.css';
import maldivesImg from '../../assets/maldives.jpg';
import dubaiImg from '../../assets/dubai.jpg';
import mauritiusImg from '../../assets/mauritius.jpg';
import cyprusImg from '../../assets/cyprus.jpg';


const UpcomingTrips = () => {
  const [sortOrder, setSortOrder] = useState('default');

  const trips = [
    {
      id: 1,
      title: "Maldivi Akcija iz Sarajeva",
      departure: "27. 8. 2025.",
      return: "5. 9. 2025.",
      days: 10,
      originalPrice: 3200,
      currentPrice: 2580,
      rating: 4,
      image: maldivesImg,
      spotsLeft: 4
    },
    {
      id: 2,
      title: "Euro Basket 2025 - Kipar iz Sarajeva",
      departure: "27. 8. 2025.",
      return: "5. 9. 2025.",
      days: 10,
      originalPrice: 3100,
      currentPrice: 2280,
      rating: 4,
      image: cyprusImg,
      spotsLeft: 4
    },
    {
      id: 3,
      title: "Dubai Akcija iz Sarajeva",
      departure: "5. 9. 2025.",
      return: "10. 9. 2025.",
      days: 6,
      originalPrice: 2100,
      currentPrice: 1680,
      rating: 4,
      image: dubaiImg,
      spotsLeft: 4
    },
    {
      id: 4,
      title: "Mauricijus Avantura iz Sarajeva",
      departure: "15. 9. 2025.",
      return: "25. 9. 2025.",
      days: 11,
      originalPrice: 4080,
      currentPrice: 3580,
      rating: 5,
      image: mauritiusImg,
      spotsLeft: 2
    }
  ];

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

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
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card">
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
                  <img src={trip.image} alt={trip.title} />
                </div>

                <div className="trip-details">
                  <h3>{trip.title}</h3>
                  <div className="rating">
                    {[...Array(5)].map((_, index) => (
                      <span 
                        key={index} 
                        className={`star ${index < trip.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="spots-left">Posljednja {trip.spotsLeft} mjesta</span>
                  </div>
                </div>

                <div className="trip-pricing">
                  <div className="price-column">
                    <span className="price-label">cijena</span>
                    <span className="original-price">{trip.originalPrice.toLocaleString()}</span>
                    <span className="currency">,00 BAM</span>
                  </div>
                  <div className="price-column">
                    <span className="price-label">sada od</span>
                    <span className="current-price">{trip.currentPrice.toLocaleString()}</span>
                    <span className="currency">,00 BAM</span>
                  </div>
                </div>

                <div className="trip-actions">
                  <button className="btn-view">Pogledaj</button>
                  <button className="btn-save">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <button className="btn-share">Upit</button>
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