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
      <Hero onSearch={handleSearch}/>
      <div className='container'>
        <Navbar />
        <Title subTitle='Ponude'  />
        <UpcomingTrips searchQuery={searchQuery}/>
        <Title subTitle='Nudimo:' title='Najatraktivnije ponude!' />
        <Offers />
        <Title subTitle='O nama:' title='Zbog vašeg ugodnijeg putovanja!' />
        <About />
        <Title subTitle='Šta naši klijenti kažu:' />
        <Testimonials/>
        <Title subTitle='Kontakt: ' title='Slobodno nam se javi 📞' />
        <Contact/>
      </div>
    </>
  );
};

export default Home;
