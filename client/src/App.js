import React, { useState, useEffect } from 'react';
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
import Notifications from './pages/Notifications';
import ClientProfile from './pages/ClientProfile';
import MyReservations from './pages/MyReservations';
import OfferDetails from './pages/OfferDetails';
import CompareOffers from "./components/CompareOffers/CompareOffers";
import CompareModal from "./components/CompareOffers/CompareModal";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // state
  const [activeSection, setActiveSection] = useState("home");
  const [openCompareModal, setOpenCompareModal] = useState(false);

  // event listener za poredjenje
  useEffect(() => {
    const handler = () => setOpenCompareModal(true);
    window.addEventListener("openCompareModal", handler);
    return () => window.removeEventListener("openCompareModal", handler);
  }, []);

  const logout = () => {
    console.log("Logout clicked");
  };

  const shouldShowHeader = location.pathname === "/admin" || location.pathname === "/agency";

  return (
    <>
      {shouldShowHeader && (
        <Header 
          setActiveSection={setActiveSection}
          handleSectionChange={setActiveSection}
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
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/clientprofile" element={<ClientProfile />} />
        <Route path="/myreservations" element={<MyReservations />} />
        <Route path="/offerdetails/:id" element={<OfferDetails />} />
      </Routes>

      {/* za poredjenje ponuda */}
      <CompareModal isOpen={openCompareModal} onClose={() => setOpenCompareModal(false)}>
        <CompareOffers />
      </CompareModal>

      <Footer />
    </>
  );
};

export default App;
