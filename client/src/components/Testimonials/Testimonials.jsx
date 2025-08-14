import React, { useRef, useState } from 'react';
import './Testimonials.css';
import next_icon from '../../assets/next-icon.png';
import back_icon from '../../assets/back-icon.png';
/* dodati prave slike kasnije */
import user_1 from '../../assets/user-1.png';
import user_2 from '../../assets/user-1.png';
import user_3 from '../../assets/user-1.png';
import user_4 from '../../assets/user-1.png';
import user_5 from '../../assets/user-1.png';


const Testimonials = () => {

    const slider = useRef(null);
    const [tx, setTx] = useState(0);

    const slideForward = () => {
        if (tx > -100) {  
            const newTx = tx - 25;
            setTx(newTx);
            if (slider.current) slider.current.style.transform = `translateX(${newTx}%)`;
        }
    }

    const slideBackward = () => {
        if (tx < 0) {
            const newTx = tx + 25;
            setTx(newTx);
            if (slider.current) slider.current.style.transform = `translateX(${newTx}%)`;
        }
    }

    return (
        <div className='testimonials'> 
            <img src={next_icon} alt="" className='next-btn' onClick={slideForward} />
            <img src={back_icon} alt="" className='back-btn' onClick={slideBackward} />
            <div className="slider">
                <ul ref={slider}>
                    <li>
                        <div className="slide">
                            <div className="user-info">
                                <img src={user_1} alt='' />
                                <div>
                                    <h3>Marija Moravac</h3>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <p>ePutovanje mi je omogućilo da brzo pronađem i rezervišem putovanje koje sam željela, sve na jednom mjestu!</p>
                    </li>
                    <li>
                        <div className="slide">
                            <div className="user-info">
                                <img src={user_2} alt='' />
                                <div>
                                    <h3>Srđan Zeljković</h3>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <p>Rezervacija preko ePutovanja je jednostavna i sigurna, a sve informacije su jasno prikazane.</p>
                    </li>
                    <li>
                        <div className="slide">
                            <div className="user-info">
                                <img src={user_3} alt='' />
                                <div>
                                    <h3>Marina Gogić</h3>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <p>Konačno platforma koja mi štedi vrijeme – od planiranja do rezervacije putovanja.</p>
                    </li>
                    <li>
                        <div className="slide">
                            <div className="user-info">
                                <img src={user_4} alt='' />
                                <div>
                                    <h3>Dijana Vatreš</h3>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <p>Omogućava direktnu komunikaciju sa turističkim agencijama – sve je brzo i profesionalno.</p>
                    </li>
                    <li>
                        <div className="slide">
                            <div className="user-info">
                                <img src={user_5} alt='' />
                                <div>
                                    <h3>Miloš Pajić</h3>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <p>Najbolja online platforma za uspoređivanje različitih putovanja i planiranje odmora.</p>
                    </li>
                </ul>
            </div>
        </div>
    )
}


export default Testimonials