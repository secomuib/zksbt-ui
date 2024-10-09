'use client';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { Contract, BrowserProvider } from 'ethers';
import zkSBTAddress from "./ZKSBT.json";

// Function to initialize MetaMask connection and contract instance
const zksbt = async () => {
  // Check if MetaMask is available in the browser
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    try {
      // Request account access from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create a new provider using the MetaMask injected provider
      const provider = new BrowserProvider(window.ethereum);

      // Get the signer (the connected account)
      const signer = await provider.getSigner();

      // Initialize the contract instance with the signer
      let zksbt = new Contract(zkSBTAddress.address, zkSBTAddress.abi, signer);

      return zksbt;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return null;
    }
  } else {
    console.log("MetaMask is not installed. Please install MetaMask to use this feature.");
    return null;
  }
};

// Export the function to initialize the contract
export default zksbt;