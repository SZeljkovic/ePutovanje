import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      setToken(storedToken);
      setUser(parsedUser);
    } else {
      console.log("Nema stored podataka");
    }
    
    setIsLoading(false);
  }, []);


const login = (newToken, tipKorisnika, korisnickoIme) => {
  
  const userObj = {
    TipKorisnika: tipKorisnika,
    KorisnickoIme: korisnickoIme
  };
  
  localStorage.setItem("token", newToken);
  localStorage.setItem("user", JSON.stringify(userObj));
  setToken(newToken);
  setUser(userObj);
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    isLoading,
    loggedIn: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};