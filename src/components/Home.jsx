import React, { useEffect, useState } from 'react';
import Game from './Game';

export default function Home() {
  const [isBoardActive, setIsBoardActive] = useState(false); 
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    Balance();
  }, []);

  const Balance = async () => {
    try {
      const balance = await window.fewcha.getBalance();
      console.log('Balance:', balance.data);
      setBalance(balance.data / 100000000);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const walletDisconnect = async () => {
    try {
      await window.fewcha.disconnect();
      console.log('Wallet disconnected');
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleBetPlaced = (isActive) => {
    setIsBoardActive(isActive);
  };

  return (
    <div className="bg-sky-950 min-h-screen relative">
      <div className="absolute top-5 right-5 flex items-center space-x-4">
        <div className="bg-white text-black py-2 px-4 rounded shadow-lg">
          Balance: {balance} APT
        </div>
        <button 
          className="bg-white text-black py-2 px-4 rounded shadow-lg hover:bg-gray-300"
          onClick={walletDisconnect}
        >
          Disconnect
        </button>
      </div>
      <div className="min-h-screen flex items-center justify-center bg-sky-950 text-white">
        <div className="flex flex-row space-x-10">
          <Game onBetPlaced={handleBetPlaced} />
        </div>
      </div>
    </div>
  );
}
