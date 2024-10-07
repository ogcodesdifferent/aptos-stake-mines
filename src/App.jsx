import React, { useState, useEffect } from 'react';
import Login from './components/Login'
import Home from './components/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const balanceResponse = await window.fewcha.getBalance();
        if(balanceResponse.data !== undefined) 
          setBalance(balanceResponse.data);
      } catch (error) {
        console.error('Error connecting or fetching balance:', error);
      }
    }
    fetchBalance();
  }, []);

  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={balance !== null ? <Home /> : <Login />} />
      </Routes>
    </BrowserRouter>

    </div>
  )
}
