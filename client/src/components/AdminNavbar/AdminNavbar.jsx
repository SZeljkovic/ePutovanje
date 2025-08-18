import React, { useState } from "react";
import { Nav, Collapse } from "react-bootstrap";

const AdminNavbar = ({ activeSection, handleSectionChange }) => {
  const [openNalozi, setOpenNalozi] = useState(false);
  const [openPonude, setOpenPonude] = useState(false);

  return (
    <div className="admin-sidebar bg-dark text-light vh-100 d-flex flex-column p-3">
      <h3 className="text-white mb-4">Admin Panel</h3>

      <Nav className="flex-column">
        <Nav.Link
          onClick={() => setOpenNalozi(!openNalozi)}
          aria-controls="nalozi-collapse"
          aria-expanded={openNalozi}
          className="text-white fw-bold"
        >
          Nalozi
        </Nav.Link>
        <Collapse in={openNalozi}>
          <div id="nalozi-collapse" className="ms-3">
            <Nav.Link
              onClick={() => handleSectionChange("users")}
              className="text-white"
            >
              Svi nalozi
            </Nav.Link>
            <Nav.Link
              onClick={() => handleSectionChange("suspended")}
              className="text-white"
            >
              Suspendovani nalozi
            </Nav.Link>
            <Nav.Link
              onClick={() => handleSectionChange("requests")}
              className="text-white"
            >
              Zahtjevi
            </Nav.Link>
            <Nav.Link
              onClick={() => handleSectionChange("create-admin")}
              className="text-white"
            >
              Kreiraj admin nalog
            </Nav.Link>
          </div>
        </Collapse>

        <Nav.Link
          onClick={() => setOpenPonude(!openPonude)}
          aria-controls="ponude-collapse"
          aria-expanded={openPonude}
          className="text-white fw-bold mt-2"
        >
          Ponude
        </Nav.Link>
        <Collapse in={openPonude}>
          <div id="ponude-collapse" className="ms-3">
            <Nav.Link
              onClick={() => handleSectionChange("offers")}
              className="text-white"
            >
              Sve ponude
            </Nav.Link>
            <Nav.Link
              onClick={() => handleSectionChange("offer-requests")}
              className="text-white"
            >
              Zahtjevi
            </Nav.Link>
          </div>
        </Collapse>

        <Nav.Link
          onClick={() => handleSectionChange("destinations")}
          className="text-white fw-bold mt-2"
        >
          Destinacije
        </Nav.Link>
      </Nav>   
    </div>
  );
};

export default AdminNavbar;
