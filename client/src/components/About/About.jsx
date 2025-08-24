import React, { useState } from 'react';
import './About.css';

import bgImg from '../../assets/tvoja-slika.png'; 
import logoImg from '../../assets/logoIme.png';  

const About = () => {
  const [expanded, setExpanded] = useState(false);

  const fullText = `
ePutovanje je moderan vodič kroz svijet putovanja - mjesto gdje se susreću vaše želje 
i najbolje ponude turističkih agencija. Na jednoj platformi možete istražiti destinacije, 
uporediti cijene i uslove, pročitati recenzije drugih putnika, te odmah rezervisati idealno putovanje.
Za putnike, ePutovanje znači manje vremena u pretraživanju, a više u uživanju. Za turističke agencije, 
to je prilika da na jasan i efikasan način predstave svoje ponude, dopru do novih klijenata i grade povjerenje.
Naš cilj je da svaka avantura započne sa lakoćom i završi sa nezaboravnim uspomenama.
Vjerujemo da putovanje nije samo destinacija, već iskustvo koje mijenja perspektivu i obogaćuje život. 
Zato stvaramo platformu koja vas povezuje sa svijetom i inspiriše na nove korake.
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
