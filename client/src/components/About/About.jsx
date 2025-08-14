import React, { useState, useEffect } from 'react';
import './About.css';

import img1 from '../../assets/vienna.jpg';
import img2 from '../../assets/maldives.jpg';
import img3 from '../../assets/mauritius.jpg';
import img4 from '../../assets/innsbruck.jpg';
import img5 from '../../assets/dubai.jpg';

const About = () => {
  const images = [img1, img2, img3, img4, img5];
  const [indexes, setIndexes] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexes((prev) => prev.map(i => (i + 1) % images.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="about-bg">
      <div className="image-columns">
        {indexes.map((imgIndex, col) => (
          <div className="image-column" key={col}>
            <img src={images[imgIndex]} alt="" />
          </div>
        ))}
      </div>

      <div className="about-overlay">
         <p>
          ePutovanje je organizacija nastala povodom projektnog zadatka iz
          predmeta projektovanje softvera. Naša misija je da vaše putovanje bude
          jednostavno i nezaboravno. EPutovanje je aplikacija koja olakšava planiranje putovanja pružajući korisnicima jednostavan 
          pregled svih dostupnih opcija putovanja ka različitim destinacijama, kao i mogućnost direktnog 
          rezervisanja istih. Korisnici će moći brzo pregledati ponudu putovanja, unijeti željenu destinaciju, 
          istražiti detalje o ponudama, uključujući recenzije i ocene drugih putnika, te kontaktirati direktno 
          turističku agenciju koja pruža usluge za odabrano putovanje. Takođe, aplikacija će omogućiti 
          upoređivanje različitih ponuda kako bi korisnici mogli pronaći najpovoljniju opciju. S druge 
          strane, turističke agencije, kao poslovni subjekti, će imati mogućnost efikasnog promovisanja 
          svojih usluga putem platforme, pružajući sve relevantne informacije o svojim ponudama na 
          jednom centralnom mjestu. 
        </p>
      </div>
    </div>
  );
};

export default About;
