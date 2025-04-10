import React from 'react';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import SpecialOffers from '../components/SpecialOffers';
import RecentProducts from '../components/RecentProducts';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div>
            <Banner />
            <Categories />
            <SpecialOffers />
            <RecentProducts />
            <Newsletter />
            <Footer />
        </div>
    );
};

export default Home;