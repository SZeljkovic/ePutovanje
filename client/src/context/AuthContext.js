import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Kad se aplikacija pokrene, provjeri token
    if (localStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, []);

  const login = (token, tipKorisnika, korisnickoIme) => {
    localStorage.setItem("token", token);
    localStorage.setItem("TipKorisnika", tipKorisnika);
    localStorage.setItem("KorisnickoIme", korisnickoIme);
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("TipKorisnika");
    localStorage.removeItem("KorisnickoIme");
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
