import getContract from "./escrowContract";

export default async function getEscrows(provider) {
  const escrowContract = getContract(provider);
  const escrowsNo = await escrowContract.escrowsNo();
  const escrows = [];
  for (let index = 1; index <= Number(escrowsNo); index++) {
    const escrow = await escrowContract.getEscrow(index);
    escrows.push(escrow);
  }

  return escrows;
}
