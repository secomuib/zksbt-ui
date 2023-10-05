import { getAddress, parseEther } from "ethers";
import { Presets } from "userop";

const builderTransfer0Ethers = (account: Presets.Builder.SimpleAccount) => {
  const target = getAddress("0x5DF100D986A370029Ae8F09Bb56b67DA1950548E");
  const value = parseEther("0");
  const builder = account.execute(target, value, "0x");

  return builder;
};

export {
  builderTransfer0Ethers
};