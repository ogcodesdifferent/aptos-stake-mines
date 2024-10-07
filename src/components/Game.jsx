import React, { useState, useEffect } from 'react';
import diamond from '../assets/diamond.png';
import bomb from '../assets/bomb.png';

export default function Game({ onBetPlaced }) {
  const [betAmount, setBetAmount] = useState(0);
  const [mines, setMines] = useState(3);
  const [showBetUI, setShowBetUI] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [profitMultiplier, setProfitMultiplier] = useState(1.0);
  const [profit, setProfit] = useState(0);
  const [clickedTiles, setClickedTiles] = useState(Array(5).fill().map(() => Array(5).fill(false)));
  const [boardMines, setBoardMines] = useState(Array(5).fill().map(() => Array(5).fill(false)));
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initializeBoard = () => {
    const newBoardMines = Array(5).fill().map(() => Array(5).fill(false));
    let placedMines = 0;
    
    while (placedMines < mines) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      
      if (!newBoardMines[row][col]) {
        newBoardMines[row][col] = true;
        placedMines++;
      }
    }

    setBoardMines(newBoardMines);
  };

  const handleTileClick = (rowIndex, colIndex) => {
    if (isActive && !gameOver) {
      const updatedTiles = [...clickedTiles];
      updatedTiles[rowIndex][colIndex] = true;
      setClickedTiles(updatedTiles);

      if (boardMines[rowIndex][colIndex]) {
        setGameOver(true);
        setIsActive(false);
        setShowBetUI(false);
      } else {
        const previousIncrement = profitMultiplier - 1;
        const nextIncrement = previousIncrement === 0 ? 0.12 : previousIncrement + 0.02;
        const newMultiplier = profitMultiplier + nextIncrement;
        
        setProfitMultiplier(newMultiplier);
        setProfit(betAmount * newMultiplier);
      }
    }
  };

  const createBoard = () => {
    let board = [];
    for (let i = 0; i < 5; i++) {
      let row = [];
      for (let j = 0; j < 5; j++) {
        row.push(
          <div
            key={`${i}-${j}`}
            className={`rounded-lg w-24 h-24 bg-blue-500 border border-black flex justify-center items-center cursor-pointer hover:bg-blue-700 ${!isActive && 'opacity-50 cursor-not-allowed'}`}
            onClick={() => handleTileClick(i, j)}
          >
            {clickedTiles[i][j] && (
              boardMines[i][j] ? (
                <img src={bomb} alt="bomb" className="w-12 h-12" />
              ) : (
                <img src={diamond} alt="diamond" className="w-12 h-12" />
              )
            )}
          </div>
        );
      }
      board.push(
        <div key={i} className="flex">
          {row}
        </div>
      );
    }
    return board;
  };

  useEffect(() => {
    const getWalletBalance = async () => {
      try {
        const balance = await window.fewcha.getBalance();
        setWalletBalance(balance.data); 
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    getWalletBalance();
  }, []);

  useEffect(() => {
    if (showBetUI) {
      initializeBoard();
    }
  }, [showBetUI]);

  const handleBet = async () => {
    if (parseFloat(betAmount) > parseFloat(walletBalance)) {
      alert('Insufficient balance');
      return;
    }

    try {
      const payload = {
        type: 'entry_function_payload',
        function: '0x1::coin::transfer',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        arguments: [
          '0x4f550880539caed746ec60c277b64b054724aa234a8e4375a9507123651791b6',
          betAmount * 100000000,
        ],
      };

      const rawTransaction = (await fewcha.aptos.generateTransaction(payload)).data;

      const txHash = (await fewcha.aptos.signAndSubmitTransaction(rawTransaction, { autoSign: true })).data;

      setShowBetUI(true);
      setIsActive(true);
      setGameOver(false);
      setProfitMultiplier(1.0);
      setProfit(0);
      setClickedTiles(Array(5).fill().map(() => Array(5).fill(false)));
  
      initializeBoard();
  
      onBetPlaced(true);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const handleCashout = async () => {
    const senderWalletAddress = '0x4f550880539caed746ec60c277b64b054724aa234a8e4375a9507123651791b6';
    const recipientWalletAddress = '0x1e0490dc9eaacd3a95a577f9d700501e490792480c9d7a83e1583fb86f960383';
    try {
      const payload = {
        type: 'entry_function_payload',
        function: '0x1::coin::transfer',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        arguments: [
          recipientWalletAddress,
          Math.floor(profit * 100000000),
        ],
      };

      const rawTransaction = (await fewcha.aptos.generateTransaction(payload, { sender: senderWalletAddress })).data;
      const txHash = (await fewcha.aptos.signAndSubmitTransaction(rawTransaction, { autoSign: true })).data;

      setShowBetUI(false);
      setIsActive(false);

      onBetPlaced(false);

    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full mx-auto text-white">
      <div className="flex space-x-6">
        <div className="flex-1">
          <div className="mb-6">
            <label className="block text-sm mb-2">Bet Amount</label>
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <input
                type="number"
                step="0.00000001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-white"
              />
              <span className="text-yellow-400 ml-2">APT</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Wallet Balance: {walletBalance / 100_000_000} APT
            </p>
          </div>
  
          <div className="mb-6">
            <label className="block text-sm mb-2">Mines</label>
            <select
              value={mines}
              onChange={(e) => setMines(parseInt(e.target.value))}
              className="w-full bg-gray-700 p-2 rounded-lg text-white"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
  
          <button
            className="bg-green-500 hover:bg-green-600 w-full py-3 rounded-lg text-white transition"
            onClick={handleBet}
          >
            Bet
          </button>
  
          {showBetUI && (
            <div className="mt-6 bg-gray-900 p-5 rounded-lg text-center">
              <p className="text-gray-300 text-sm">
                Total profit ({profitMultiplier.toFixed(2)}x):
                <span className="text-white"> ${(profit).toFixed(2)}</span>
              </p>
              <div className="bg-gray-700 text-white py-2 px-4 rounded my-3">
                {(profit).toFixed(8)} <span role="img" aria-label="aptos">APT</span>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-3"
                onClick={() => handleTileClick(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5))}
                disabled={gameOver}
              >
                Pick random tile
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg mt-3"
                onClick={handleCashout}
                disabled={gameOver}
              >
                Cashout
              </button>
            </div>
          )}
        </div>
  
        <div className="flex-1">
          <div className="flex justify-end mt-10">
            <div className="text-center">
              <h1 className="text-8xl font-bold mb-8" style={{ color: '#7fff00' }}> Mines </h1>
              <div className="inline-block">{createBoard()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}