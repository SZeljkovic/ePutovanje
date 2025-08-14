import React from 'react';
import './Contact.css';
import mail_icon from '../../assets/mail-icon.png';
import phone_icon from '../../assets/phone-icon.png';
import location_icon from '../../assets/location-icon.png';

const Contact = () => {
    return (
        <div className='contact'> 
            <div className="contact-col">
                <h3>Pošaljite nam poruku</h3>
                <p>Imate pitanja ili trebate pomoć oko rezervacije putovanja? Naš tim je ovdje da vam pomogne!</p>
                <ul>
                    <li><img src={mail_icon} alt="" />eputovanje@gmail.com</li>
                    <li><img src={phone_icon} alt="" />123456789</li>
                    <li><img src={location_icon} alt="" />Ulica 1, Banja Luka</li>
                </ul>
            </div>
            <div className="contact-col">

            </div>
        </div>
    )
}


export default Contact