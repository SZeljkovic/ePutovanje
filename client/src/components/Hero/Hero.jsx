import React from 'react'
import './Hero.css'
import SearchFilter from '../SearchFilter/SearchFilter'

const Hero = () => {

  const handleSearch = (searchData) => {
    console.log('Podaci pretrage:', searchData);

  };
  return (
    <div className='hero'>
        <div className="hero-text">
            <h1>Tvoj vodič kroz putovanja</h1>
           <div style={{ marginTop: '40px' }}>
                <SearchFilter onSearch={handleSearch} />
            </div>
        </div>
    </div>
  )
}

export default Hero