import React from 'react'
import './Offers.css'
import vienna from '../../assets/beč.jpg'
import istanbul from '../../assets/istanbul.jpg'
import paris from '../../assets/pariz.jpg'

const Offers = () => {
  return (
    <div className='offers'>
        <div className="offer">
            <img src={vienna} alt="" />
            <div className="caption">
                <p>Beč</p>
            </div>
        </div>
        <div className="offer">
            <img src={istanbul} alt="" />
            <div className="caption">
                <p>Istanbul</p>
            </div>
        </div>
        <div className="offer">
            <img src={paris} alt="" />
            <div className="caption">
                <p>Pariz</p>
            </div>
        </div>
    </div>
  )
}

export default Offers