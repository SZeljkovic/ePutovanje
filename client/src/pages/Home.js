import React from 'react';
import Hero from '../components/Hero/Hero';
import Offers from '../components/Offers/Offers';
import Title from '../components/Title/Title';
import About from '../components/About/About';
import Footer from '../components/Footer/Footer';
import UpcomingTrips from '../components/UpcomingTrips/UpcomingTrips';


const Home = () => {
  return (
    <>
      <Hero />
      <div className='container'>
        <Title subTitle='Ponude'  />
        <UpcomingTrips />
        <Title subTitle='Nudimo:' title='Najatraktivnije ponude!' />
        <Offers />
        <About />
        <Title subTitle='Kontakt: ' title='Slobodno nam se javi 📞' />
      </div>
    </>
  );
};

export default Home;
