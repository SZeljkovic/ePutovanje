import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import './Login.css'

const Login = () => {
  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <h2>Prijava</h2>
        <form className="login-form">
          <input type="text" placeholder="Korisničko ime" />
          <input type="password" placeholder="Lozinka" />
          <button type="submit">Prijavi se</button>
        </form>
      </div>
      <Footer />
    </div>
  )
}

export default Login
