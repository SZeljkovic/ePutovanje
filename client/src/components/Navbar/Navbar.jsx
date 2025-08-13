import React, { useEffect, useState, useContext } from "react";
import "./Navbar.css";
import logo from "../../assets/logo4.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const { loggedIn, logout } = useContext(AuthContext);
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
        <li>Pretraga</li>
        <li>O nama</li>
        <li>Kontakt</li>
        <li>
          {loggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaUserCircle size={28} style={{ cursor: "pointer" }} />
              <button className="btn" onClick={handleLogout}>Odjava</button>
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
