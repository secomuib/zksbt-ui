'use client';

import { Contract, providers } from 'ethers';
import zkpSBTAddress from "../web3/ZKPSBT.json";

declare var window: any;

let signer;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" }); 
  const provider = new providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
} else {
  // We are on the server *OR* the user is not running metamask
  signer = new providers.InfuraProvider(
    "goerli",
    process.env.INFURA_API_KEY || "15c1d32581894b88a92d8d9e519e476c"
  );
}

const zkpsbt = new Contract(zkpSBTAddress.address, zkpSBTAddress.abi, signer);

export default zkpsbt;
