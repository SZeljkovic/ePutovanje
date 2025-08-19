import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import AgencyHome from './pages/AgencyHome';
import Register from './pages/Register';
import Inbox from './pages/Inbox';
import Header from './components/Header/Header';
import ReportProblem from './pages/ReportProblem';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection, handleSectionChange] = useState("home");

  const logout = () => {
    console.log("Logout clicked");
  };

  const shouldShowHeader = location.pathname === "/admin" || location.pathname === "/agency";

  return (
    <>
      {shouldShowHeader && (
        <Header 
          setActiveSection={setActiveSection}
          handleSectionChange={handleSectionChange}
          logout={logout}
          navigate={navigate}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/agency" element={<AgencyHome />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/reportproblem" element={<ReportProblem />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
