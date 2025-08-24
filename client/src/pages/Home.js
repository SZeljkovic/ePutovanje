import React, { useState } from 'react';
import Hero from '../components/Hero/Hero';
import Offers from '../components/Offers/Offers';
import Title from '../components/Title/Title';
import About from '../components/About/About';
import UpcomingTrips from '../components/UpcomingTrips/UpcomingTrips';
import Testimonials from '../components/Testimonials/Testimonials';
import Contact from '../components/Contact/Contact';
import Navbar from '../components/Navbar/Navbar';


const Home = () => {

   const [searchQuery, setSearchQuery] = useState(null);

   const handleSearch = (searchData) => {
    setSearchQuery(searchData);
  };

  return (
    <>
      <Hero onSearch={handleSearch} />
      <div className='container'>
        <Navbar />
        <Title subTitle='Ponude' />
        <div id="search">
        <UpcomingTrips searchQuery={searchQuery} />
        </div>
        <Title subTitle='Nudimo:' title='Najpopularnije ove sezone!' />
        <Offers />

        <Title subTitle='O nama:' title='Zbog vašeg ugodnijeg putovanja!' />
        <div id="about">
          <About />
        </div>

        <Title subTitle='Šta naši klijenti kažu:' />
        <Testimonials />

        <Title subTitle='Kontakt: ' title='Slobodno nam se javi 📞' />
        <div id="contact">
          <Contact />
        </div>
      </div>

    </>
  );
};

export default Home;
