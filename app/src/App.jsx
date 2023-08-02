import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import CreateEscrow from "./components/CreateEscrow";
import Escrows from "./components/Escrows";
import getEscrows from "./getEscrows";
import Navbar from "./components/Navbar";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const App = () => {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [increaseTx, setIncreaseTx] = useState(0);

  const reload = () => {
    setIncreaseTx(increaseTx + 1);
  };

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    async function fetchEscrows() {
      const fetchedEscrows = await getEscrows(provider);
      setEscrows(fetchedEscrows);
    }

    fetchEscrows();
  }, [increaseTx]);

  return (
    <>
      <Navbar />
      <Grid container marginTop={7} spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <CreateEscrow signer={signer} reload={reload} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <Escrows
              signer={signer}
              escrows={escrows}
              reload={reload}
              account={account}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default App;
