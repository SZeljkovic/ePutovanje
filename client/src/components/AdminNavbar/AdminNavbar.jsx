import React, { useState } from "react";
import { Nav, Collapse } from "react-bootstrap";

const AdminNavbar = ({ activeSection, handleSectionChange }) => {
  const [openNalozi, setOpenNalozi] = useState(false);
  const [openPonude, setOpenPonude] = useState(false);

  return (
    <div className="admin-sidebar vh-100 d-flex flex-column p-0" 
         style={{
           background: '#1a1a1a',
           boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
           borderRight: '1px solid rgba(255,255,255,0.08)'
         }}>

      <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Nav.Link
          onClick={() => handleSectionChange("profile")}
          className={`text-white fw-bold px-3 py-2 ${activeSection === 'profile' ? 'active' : ''}`}
          style={{
            position: 'relative',
            zIndex: 9999,
            background: activeSection === 'profile' 
              ? 'rgba(255,255,255,0.1)' 
              : 'transparent',
            transition: 'all 0.2s ease',
            borderRadius: '0',
            borderLeft: activeSection === 'profile' ? '3px solid #fff' : '3px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'profile') {
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'profile') {
              e.target.style.background = 'transparent';
            }
          }}
        >
          <i className="fas fa-user me-2"></i>
          Moj profil
        </Nav.Link>
      </div>

      <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Nav.Link
          onClick={() => handleSectionChange("dashboard")}
          className={`text-white fw-bold px-3 py-2 ${activeSection === 'dashboard' ? 'active' : ''}`}
          style={{
            background: activeSection === 'dashboard' 
              ? 'rgba(255,255,255,0.1)' 
              : 'transparent',
            transition: 'all 0.2s ease',
            borderRadius: '0',
            borderLeft: activeSection === 'dashboard' ? '3px solid #fff' : '3px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== 'dashboard') {
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'dashboard') {
              e.target.style.background = 'transparent';
            }
          }}
        >
          <i className="fas fa-tachometer-alt me-2"></i>
          Dashboard
        </Nav.Link>
      </div>

      <Nav className="flex-column flex-grow-1 p-3" style={{ overflow: 'auto' }}>

        <div className="mb-3">
          <Nav.Link
            onClick={() => setOpenNalozi(!openNalozi)}
            aria-controls="nalozi-collapse"
            aria-expanded={openNalozi}
            className="text-white fw-bold px-3 py-2"
            style={{
              background: 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              borderRadius: '0'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <i className="fas fa-users me-2"></i>
            Nalozi
            <i className={`fas fa-chevron-${openNalozi ? 'up' : 'down'} float-end mt-1`}></i>
          </Nav.Link>
          
          <Collapse in={openNalozi}>
            <div id="nalozi-collapse" className="ms-2 mt-2">
              {[
                { key: 'users', icon: 'fa-list', text: 'Svi nalozi' },
                { key: 'suspended', icon: 'fa-ban', text: 'Suspendovani nalozi' },
                { key: 'requests', icon: 'fa-clock', text: 'Zahtjevi' },
                { key: 'create-admin', icon: 'fa-user-plus', text: 'Kreiraj admin nalog' }
              ].map(item => (
                <Nav.Link 
                  key={item.key}
                  onClick={() => handleSectionChange(item.key)} 
                  className={`text-white px-3 py-2 mb-1 ${activeSection === item.key ? 'active' : ''}`}
                  style={{
                    background: activeSection === item.key 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'transparent',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    borderLeft: activeSection === item.key ? '3px solid #fff' : '3px solid transparent',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.key) {
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.key) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <i className={`fas ${item.icon} me-2`}></i>
                  {item.text}
                </Nav.Link>
              ))}
            </div>
          </Collapse>
        </div>

        <div className="mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <Nav.Link
            onClick={() => setOpenPonude(!openPonude)}
            aria-controls="ponude-collapse"
            aria-expanded={openPonude}
            className="text-white fw-bold px-3 py-2"
            style={{
              background: 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              borderRadius: '0'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <i className="fas fa-tags me-2"></i>
            Ponude
            <i className={`fas fa-chevron-${openPonude ? 'up' : 'down'} float-end mt-1`}></i>
          </Nav.Link>
          
          <Collapse in={openPonude}>
            <div id="ponude-collapse" className="ms-2 mt-2">
              {[
                { key: 'offers', icon: 'fa-list-alt', text: 'Sve ponude' },
                { key: 'offer-requests', icon: 'fa-clock', text: 'Zahtjevi' }
              ].map(item => (
                <Nav.Link 
                  key={item.key}
                  onClick={() => handleSectionChange(item.key)} 
                  className={`text-white px-3 py-2 mb-1 ${activeSection === item.key ? 'active' : ''}`}
                  style={{
                    background: activeSection === item.key 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'transparent',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    borderLeft: activeSection === item.key ? '3px solid #fff' : '3px solid transparent',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.key) {
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.key) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <i className={`fas ${item.icon} me-2`}></i>
                  {item.text}
                </Nav.Link>
              ))}
            </div>
          </Collapse>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <Nav.Link
            onClick={() => handleSectionChange("destinations")}
            className={`text-white fw-bold px-3 py-2 ${activeSection === 'destinations' ? 'active' : ''}`}
            style={{
              background: activeSection === 'destinations' 
                ? 'rgba(255,255,255,0.1)' 
                : 'transparent',
              transition: 'all 0.2s ease',
              borderLeft: activeSection === 'destinations' ? '3px solid #fff' : '3px solid transparent',
              borderRadius: '0'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'destinations') {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'destinations') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <i className="fas fa-map-marker-alt me-2"></i>
            Destinacije
          </Nav.Link>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <Nav.Link
            onClick={() => handleSectionChange("problems")}
            className={`text-white fw-bold px-3 py-2 ${activeSection === 'problems' ? 'active' : ''}`}
            style={{
              background: activeSection === 'problems' 
                ? 'rgba(255,255,255,0.1)' 
                : 'transparent',
              transition: 'all 0.2s ease',
              borderLeft: activeSection === 'problems' ? '3px solid #fff' : '3px solid transparent',
              borderRadius: '0'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'problems') {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'problems') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <i className="fas fa-map-marker-alt me-2"></i>
            Problemi
          </Nav.Link>
        </div>

      </Nav>
    </div>
  );
};

export default AdminNavbar;