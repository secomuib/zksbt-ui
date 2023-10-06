import { 
  BytesLike,
  Contract,
  getAddress,
  InfuraProvider,
  parseEther
} from "ethers";
import { Presets } from "userop";
import zkSBTAddress from "./ZKSBT.json";

const builderTransfer0Ethers = (account: Presets.Builder.SimpleAccount) => {
  const target = getAddress("0x5DF100D986A370029Ae8F09Bb56b67DA1950548E");
  const value = parseEther("0");
  const builder = account.execute(target, value, "0x");

  return builder;
};

type EncryptedDataStruct = {
  iv: BytesLike;
  ephemPublicKey: BytesLike;
  ciphertext: BytesLike;
  mac: BytesLike;
};

const mintBuilder = (
  account: Presets.Builder.SimpleAccount,
  to: string,
  root: BytesLike,
  encryptedCreditScore: EncryptedDataStruct,
  encryptedIncome: EncryptedDataStruct,
  encryptedReportDate: EncryptedDataStruct
) => {
  const signer = new InfuraProvider(
    "goerli",
    process.env.INFURA_API_KEY || "15c1d32581894b88a92d8d9e519e476c"
  );
  const zksbt = new Contract(zkSBTAddress.address, zkSBTAddress.abi, signer);

  const encodedCallData = zksbt.interface.encodeFunctionData(
    "mint",
    [
      to,
      root,
      encryptedCreditScore,
      encryptedIncome,
      encryptedReportDate
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
  process.env.INFURA_API_KEY || "15c1d32581894b88a92d8d9e519e476c"
);

const zksbt = new Contract(zkSBTAddress.address, zkSBTAddress.abi, signer);
  
export {
  builderTransfer0Ethers,
  mintBuilder,
  zksbt
};