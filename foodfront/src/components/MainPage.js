import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import { motion } from 'framer-motion';
const MainPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="main-container">
      <h1 className="title">Eat like a computational linguist</h1>
      <motion.button
        className='query-button'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/query')}
      >
        Querycious!
      </motion.button>
    </div>
  );
};

export default MainPage;