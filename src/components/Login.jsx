import React from 'react';
import loginImg1 from '../assets/login-img1.png'; 
import loginImg2 from '../assets/login-img2.png'; 

export default function Login() {

  const walletConnect = async () => {
    try {
      await window.fewcha.connect();
      const balanceResponse = await window.fewcha.getBalance();
      window.location.reload();
    } catch (error) {
      console.error('Error connecting or fetching balance:', error);
    }
  }

  return (
    <div class="bg-sky-950 min-h-screen flex items-center justify-center">
      <div class="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4">
        <div class="flex-1 text-white text-left p-6">
          <h1 
            class="mb-4 font-proxima-nova text-[32px] font-bold">
            An unrivalled Online Casino & Sportsbook
          </h1>
          <button onClick={walletConnect}>Connect to Wallet</button>
        </div>
        <div class="flex-1 flex items-center justify-center">
          <div class="grid grid-cols-2 gap-4">
            <img src={loginImg1} alt="Login Image 1" class="w-full object-cover h-96" />
            <img src={loginImg2} alt="Login Image 2" class="w-full object-cover h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}
