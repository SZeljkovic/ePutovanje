import React, { useContext } from "react";
import logo from "../../assets/logo3.png";
import chatIcon from "../../assets/chat.png"; 
import bellIcon from "../../assets/bell.png"; 
import "./Header.css";
import { AuthContext } from "../../context/AuthContext";

const Header = ({ setActiveSection, navigate }) => {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="h-44" />
      </div>

      <div className="header-right">
        {token && user ? (
          <>
            <button
              className="chat-btn"
              onClick={() => navigate("/inbox")}
              title="Chat poruke"
            >
              <img src={chatIcon} alt="Chat" className="chat-icon" />
            </button>

            <button
              className="notif-btn"
              onClick={() => navigate("/notifications")}
              title="Obavještenja"
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
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
