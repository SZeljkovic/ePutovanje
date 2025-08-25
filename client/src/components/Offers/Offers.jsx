import React, { useState } from 'react';
import './Offers.css';
import vienna from '../../assets/beč.jpg';
import istanbul from '../../assets/istanbul.jpg';
import paris from '../../assets/pariz.jpg';

const Offers = () => {
  const [activeOffer, setActiveOffer] = useState(null);

  const handleClick = (index) => {
    if (activeOffer === index) {
      setActiveOffer(null);
    } else {
      setActiveOffer(index);
    }
  };

  const offersData = [
    {
      image: vienna,
      title: "Beč",
      description: "Beč, glavni grad Austrije, poznat je po svojoj bogatoj kulturnoj baštini, impresivnoj arhitekturi i muzi;koj tradiciji. Posjetite dvorac Schönbrunn, muzeje u Museumsquartieru ili uživajte u bečkoj šnicli u jednom od tradicionalnih restorana."
    },
    {
      image: istanbul,
      title: "Istanbul",
      description: "Istanbul, grad na dva kontinenta, spoj je Europe i Azije. Obavezno posjetite Aya Sofiyu, Plavu džamiju i Grand Bazaar. Okusite autentičnu tursku kuhinju i doživite jedinstvenu atmosferu ovog istorijskog grada."
    },
    {
      image: paris,
      title: "Pariz",
      description: "Grad svjetlosti, Pariz, privlači posjetioce svojom romantičnom atmosferom, world-class muzejima i prepoznatljivim znamenitostima. Od uspona na Eiffelov toranj do šetnje Champs-Élysées, Pariz nudi nezaboravno iskustvo svakom posjetiocu."
    }
  ];

  return (
    <div className='offers'>
      {offersData.map((offer, index) => (
        <div 
          className="offer" 
          key={index}
          onClick={() => handleClick(index)}
        >
          <img src={offer.image} alt={offer.title} />
          <div className="caption">
            <p>{offer.title}</p>
          </div>
          <div className={`description ${activeOffer === index ? 'active' : ''}`}>
            <p>{offer.description}</p>
            {/*<button 
              className="close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setActiveOffer(null);
              }}
            >
              ×
            </button>*/}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Offers;