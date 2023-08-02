import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ethers } from "ethers";

import Title from "./Title";
import getContract from "../escrowContract";

export async function create(signer, value, beneficiary, reload) {
  const escrow = getContract(signer);
  const createTxn = await escrow
    .connect(signer)
    .createEscrow(beneficiary, { value });
  await createTxn.wait();
  escrow.on("EscrowCreated", () => {
    reload();
  });
}

export default function CreateEscrow({ signer, reload }) {
  const [state, setState] = useState({ beneficiary: "", amount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const value = ethers.utils.parseEther(state.amount);
    await create(signer, value, state.beneficiary, reload);
    setIsLoading(false);
  };

  const handleInputChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <React.Fragment>
      <Title>Create Escrow</Title>

      {signer && (
        <>
          <TextField
            disabled={isLoading}
            required
            id="outlined-required"
            label="Beneficiary"
            name="beneficiary"
            helperText={"beneficiary's address"}
            value={state.beneficiary}
            onChange={handleInputChange}
          />
          <TextField
            disabled={isLoading}
            required
            id="outlined-required"
            label="amount"
            name="amount"
            helperText={"Escrow amount"}
            value={state.amount}
            onChange={handleInputChange}
          />
          <Button
            variant="contained"
            onClick={handleOnSubmit}
            disabled={isLoading}
          >
            Submit
          </Button>
        </>
      )}
    </React.Fragment>
  );
}
