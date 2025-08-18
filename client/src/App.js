import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import Footer from './components/Footer/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import AgencyHome from './pages/AgencyHome';
import Register from './pages/Register';
import Inbox from './pages/Inbox';
import Header from './components/Header/Header';

/*const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/agency" element={<AgencyHome />} />
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
      <Footer />
    </>
  );
};*/

const App = () => {
  const location = useLocation();
  const shouldShowHeader = location.pathname === "/admin" || location.pathname === "/agency";

  return (
    <>
      {shouldShowHeader && <Header />} 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/agency" element={<AgencyHome />} />
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
