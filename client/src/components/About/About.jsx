import React, { useState } from 'react';
import './About.css';

import bgImg from '../../assets/tvoja-slika.png'; // ubaci svoju pozadinsku sliku
import logoImg from '../../assets/logoIme.png';   // ubaci svoj logo

const About = () => {
  const [expanded, setExpanded] = useState(false);

  const fullText = `
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
  `;

  // Prve 3 rečenice
  const sentences = fullText.split('.');
  const shortText = sentences.slice(0, 3).join('.') + '.';

  return (
    <div 
      className="about-bg" 
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className={`about-overlay ${expanded ? "expanded" : ""}`}>
        {/* Logo iznad teksta */}
        <img src={logoImg} alt="Logo" className="about-logo" />

        <p>{expanded ? fullText : shortText}</p>
        <button 
          className="read-more-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Pročitaj manje" : "Pročitaj više"}
        </button>
      </div>
    </div>
  );
};

export default About;
