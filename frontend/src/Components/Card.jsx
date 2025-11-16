import React from 'react';
import Electronics from '../assets/Images/Electronics.jpg';
import Fashion from '../assets/Images/Fashion.jpg';
import HomeKitchen from '../assets/Images/HomeKitchen.jpeg';
import SportsOutdoors from '../assets/Images/SportsOutdoors.jpg';
import Books from '../assets/Images/Books.jpeg';
import BeautyHealth from '../assets/Images/BeautyHealth.jpeg';
import ToysGames from '../assets/Images/ToysGames.jpg';
import Automotive from '../assets/Images/Automotive.jpeg';
import GroceryFood from '../assets/Images/GroceryFood.jpg';
import { Link } from 'react-router-dom';

function CardSection() {
  const cards = [
    { title: 'Electronics', image: Electronics, description: 'Best gadgets and devices for you.', route: '/Electronics' },
    { title: 'Fashion', image: Fashion, description: 'Trendy styles for all seasons.', route: '/Fashion' },
    { title: 'Home & Kitchen', image: HomeKitchen, description: 'Everything you need for your home.', route: '/HomeKitchen' },
    { title: 'Sports & Outdoors', image: SportsOutdoors, description: 'Gear up for your next adventure.', route: '/SportsOutdoors' },
    { title: 'Books', image: Books, description: 'Explore a world of knowledge.', route: '/Books' },
    { title: 'Beauty & Health', image: BeautyHealth, description: 'Enhance your beauty and wellness.', route: '/BeautyHealth' },
    { title: 'Toys & Games', image: ToysGames, description: 'Fun and educational toys for kids.', route: '/ToysGames' },
    { title: 'Automotive', image: Automotive, description: 'Everything for your vehicle.', route: '/Automotive' },
    { title: 'Grocery & Gourmet Food', image: GroceryFood, description: 'Fresh and delicious food items.', route: '/Grocery' }
  ];

  return (
    <div className="py-12 px-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#411e22]">Explore Our Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.route}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 block"
          >
            <img
              src={card.image}
              alt={card.title}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#411e22]">{card.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CardSection;
