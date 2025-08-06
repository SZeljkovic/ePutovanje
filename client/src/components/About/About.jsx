import React from 'react'
import './About.css'
import about_img from '../../assets/about.png'

const About = () => {
  return (
    <div className='about'>
        <div className="about-left">
            <img src={about_img} alt="" className='about-img' />
        </div>
        <div className="about-right">
            <h3>O nama</h3>
            <h2>Zbog vašeg ugodnijeg putovanja</h2>
            <p>
                ePutovanje je organizacija nastala povodom projektnog zadatka iz predmeta projektovanje softvera
            </p>
        </div>
    </div>
  )
}

export default About