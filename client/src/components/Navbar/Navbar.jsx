import React, { useEffect, useState, useContext } from "react";
import "./Navbar.css";
import logo from "../../assets/logo4.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaEnvelope } from "react-icons/fa"; 
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
const { loggedIn, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 500 ? setSticky(true) : setSticky(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`container ${sticky ? "dark-nav" : ""}`}>
      <img src={logo} alt="" className="logo" />
      <ul>
        <li><Link to="/">Početna</Link></li>
        <li>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Pretraga
          </span>
        </li>

        <li>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            O nama
          </span>
        </li>
        <li>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Kontakt
          </span>
		  
      </li>

<li>
  {loggedIn ? (
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
	 {/* Uporedi ponude - samo za klijenta */}
      {user?.TipKorisnika === 2 && (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => window.dispatchEvent(new CustomEvent("openCompareModal"))}
        >
          Uporedi ponude
        </span>
      )}
      {/* Ikonica za inbox */}
      <FaEnvelope
        size={24}
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/inbox")}
        title="Poruke"
      />

      {/* Ikonica profila */}
      <FaUserCircle
        size={28}
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/clientprofile")}
        title="Profil"
      />

      {/* Dugme odjave */}
      <button className="btn" onClick={handleLogout}>
        Odjava
      </button>

     
    </div>
  ) : (
    <Link to="/login">
      <button className="btn">Prijava</button>
    </Link>
  )}
</li>




      </ul>
    </nav>
  );
};

export default Navbar;
