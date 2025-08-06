import React from 'react'
import './Offers.css'
import vienna from '../../assets/vienna.jpg'
import istanbul from '../../assets/istanbul.jpg'
import innsbruck from '../../assets/innsbruck.jpg'

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
            <img src={innsbruck} alt="" />
            <div className="caption">
                <p>Insbruk</p>
            </div>
        </div>
    </div>
  )
}

export default Offers