import { ethers } from "ethers";
import Escrow from "./artifacts/contracts/Escrow.sol/Escrow";
import { escrowAddress } from "./constants";

const getContract = (provider) => {
  // The Contract object
  const escrowContract = new ethers.Contract(
    escrowAddress,
    Escrow.abi,
    provider
  );

  return escrowContract;
};

export default getContract;
