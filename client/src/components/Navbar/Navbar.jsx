import React , {useEffect, useState}from 'react'
import './Navbar.css'
import logo from '../../assets/logo4.png'
import { Link } from 'react-router-dom'

const Navbar = () => {


  const [sticky, setSticky] = useState(false);


  useEffect(()=>{
    window.addEventListener('scroll', ()=>{
      window.scrollY > 500 ? setSticky(true) : setSticky(false);
    })
  },[]);

  return (
    <nav className={`container ${sticky? 'dark-nav': ''}`}>
        <img src={logo} alt="" className='logo'/>
        <ul>
            <li><Link to="/">Početna</Link></li>
            <li>Pretraga</li>
            <li>O nama</li>
            <li>Kontakt</li>
            <li>
              <Link to="/login">
              <button className='btn'>Prijava</button>
              </Link>
              </li>
        </ul>
    </nav>
  )
}

export default Navbar