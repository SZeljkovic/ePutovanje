import React from "react";
import logo from "../../assets/logo3.png";
import chatIcon from "../../assets/chat.png"; 
import bellIcon from "../../assets/bell.png"; 
import "./Header.css";

const Header = ({ setActiveSection, logout, navigate }) => {

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="h-44" />
      </div>

      <div className="header-right">
        {/*<button onClick={() => setActiveSection("profile")}>Moj Profil</button>*/}
        <button
          className="chat-btn"
          onClick={() => navigate("/inbox")}
          title="Chat poruke"
        >
          <img src={chatIcon} alt="Chat" className="chat-icon" />
        </button>
        <button
          className="notif-btn"
          onClick={() => alert("Notifikacije će biti ovdje 😉")}
        >
          <img src={bellIcon} alt="bell" className="bell-icon" />
        </button>
        <button
          className="logout-btn-header"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Odjavi se
        </button>
      </div>
    </header>
  );
};

export default Header;