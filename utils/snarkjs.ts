import verificationKey from "../public/verification_key.json";

const snarkjs = require("snarkjs");

const genProof = async (input: any) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "verifyCreditScore.wasm",
    "verifyCreditScore_0001.zkey"
  );

  return { proof, publicSignals };
};

const verifyProof = async (publicSignals: any, proof: any) => {
  const res = await snarkjs.groth16.verify(
    verificationKey,
    publicSignals,
    proof
  );

  return res;
};

export {
  genProof,
  verifyProof  
};
