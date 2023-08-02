import React from "react";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

import getContract from "../escrowContract";

const arbiter = "0xB99c0a556736a0F946ED7cdBd60a4f2a56282530";

const ActionsCell = ({ signer, id, escrow, reload, account }) => {
  console.log(signer);
  const escrowContract = getContract(signer);
  const depositorAllowed =
    account?.toLowerCase() === escrow[1].toLowerCase() && escrow[3] === 0;
  const arbiterAllowed =
    account?.toLowerCase() === arbiter.toLowerCase() && escrow[3] === 1;

  const dispute = async (e) => {
    e.preventDefault();
    const disputeTxn = await escrowContract.connect(signer).dispute(id);
    await disputeTxn.wait();
    escrowContract.on("Disputed", () => {
      reload();
    });
  };

  const approve = async (e) => {
    e.preventDefault();
    const approveTxn = await escrowContract.connect(signer).approve(id);
    await approveTxn.wait();
    escrowContract.on("Approved", () => {
      reload();
    });
  };

  const handleDispute = async (status) => {
    const handleDisputeTxn = await escrowContract
      .connect(signer)
      .handleDispute(id, status);
    await handleDisputeTxn.wait();
    escrowContract.on("Approved", () => {
      reload();
    });
    escrowContract.on("Disputed", () => {
      reload();
    });
  };

  return (
    <>
      {depositorAllowed && (
        <>
          <IconButton color="info" onClick={approve}>
            <CheckIcon />
          </IconButton>
          <IconButton color="error" onClick={dispute}>
            <CancelIcon />
          </IconButton>
        </>
      )}
      {arbiterAllowed && (
        <>
          <IconButton color="info" onClick={() => handleDispute(2)}>
            <CheckIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDispute(3)}>
            <CancelIcon />
          </IconButton>
        </>
      )}
    </>
  );
};

export default ActionsCell;
