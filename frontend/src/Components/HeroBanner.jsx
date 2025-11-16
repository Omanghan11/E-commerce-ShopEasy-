import React from 'react';
import { useNavigate } from 'react-router-dom';
import hero from '../assets/hero.mp4';

function HeroBanner() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-cover bg-center p-20 text-[#e9ecf0]">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
        autoPlay
        loop
        muted
        playsInline
        style={{ filter: 'brightness(0.5)' }}
      >
        <source src={hero} type="video/mp4" />
      </video>

      {/* Hero Content */}
      <h1 className="text-4xl font-bold text-center drop-shadow-md">
        Welcome to ShopEasy
      </h1>
      <p className="text-lg text-center drop-shadow-sm mt-2">
        Your one-stop shop for all your needs
      </p>

      {/* Shop Now Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            navigate('/ProductPage'); // ✅ Redirects to products page
            window.scrollTo(0, 0); // ✅ Ensures page scrolls to top
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer"
        >
          Shop Now
        </button>
      </div>

      <div>
        <p className="text-center mt-4 text-sm">
          Discover the best deals and offers
        </p>
      </div>
    </div>
  );
}

export default HeroBanner;


