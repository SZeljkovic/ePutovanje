import React from 'react'
import './Hero.css'
import SearchFilter from '../SearchFilter/SearchFilter'

const Hero = ({ onSearch }) => {

  return (
    <div className='hero'>
        <div className="hero-text">
            <h1>Tvoj vodič kroz putovanja</h1>
           <div style={{ marginTop: '40px' }}>
                <SearchFilter onSearch={onSearch} />
            </div>
        </div>
    </div>
  )
}

export default Hero