'use client';

import { 
  AbiCoder,
  BrowserProvider,
  BytesLike,
  Contract,
  InfuraProvider,
  parseEther
} from "ethers";
import { Presets } from "userop";
import zkSBTAddress from "./ZKSBT.json";

declare var window: any;

const getMetamaskSigner = async () => {
  let signer;

  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    // We are in the browser and metamask is running.
    window.ethereum.request({ method: "eth_requestAccounts" }); 
    const provider = new BrowserProvider(window.ethereum);
    signer = provider.getSigner();
  } else {
    // We are on the server *OR* the user is not running metamask
    signer = new InfuraProvider(
      "goerli",
      process.env.NEXT_PUBLIC_INFURA_API_KEY
    );
  }

  return signer;
}

const builderTransfer0Ethers = (target: string, account: Presets.Builder.SimpleAccount) => {
  const value = parseEther("0");
  const builder = account.execute(target, value, "0x");

  return builder;
};

const mintBuilder = (
  account: Presets.Builder.SimpleAccount,
  to: string,
  root: BytesLike,
  encryptedData: BytesLike[]
) => {
  const signer = new InfuraProvider(
    "goerli",
    process.env.NEXT_PUBLIC_INFURA_API_KEY
  );
  const zksbt = new Contract(zkSBTAddress.address, zkSBTAddress.abi, signer);

  const encodedCallData = zksbt.interface.encodeFunctionData(
    "mint",
    [
      to,
      root,
      encryptedData
    ]
  );

  const builder = account.execute(
    zkSBTAddress.address,
    0,
    encodedCallData
  );

  /* const builder = new UserOperationBuilder()
    .useDefaults({
      preVerificationGas: 100_000,
      callGasLimit: 100_000,
      verificationGasLimit: 2_000_000,
    })
    .setSender(walletContract)
    .setNonce(nonce)
    .setCallData(encodedCallData)
    .setSignature(encodedSignatures)
    .setInitCode(initCode); */

  return builder;
}

const signer = new InfuraProvider(
  "goerli",
  process.env.NEXT_PUBLIC_INFURA_API_KEY
);

const zksbt = new Contract(zkSBTAddress.address, zkSBTAddress.abi, signer);

const getTokenIdFromMintTransaction = async (txHash: string) => {
  const receipt = await signer.getTransactionReceipt(txHash);

  const abi = new AbiCoder();
  const decodedLogs = abi.decode(
    ["address","uint256"],
    receipt?.logs[1].data || ""
  );

  return decodedLogs[1].toString();
};
  
export {
  builderTransfer0Ethers,
  getTokenIdFromMintTransaction,
  getMetamaskSigner,
  mintBuilder,
  zksbt
};