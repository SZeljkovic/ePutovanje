import React from 'react'
import './Hero.css'
import SearchFilter from '../SearchFilter/SearchFilter'

const Hero = ({ onSearch, onReset }) => {

  return (
    <div className='hero'>
        <div className="hero-text">
            <h1>Tvoj vodič kroz putovanja</h1>
           <div style={{ marginTop: '40px'}}>
                <SearchFilter onSearch={onSearch} onReset={onReset} />
            </div>
        </div>
    </div>
  )
}

export default Hero