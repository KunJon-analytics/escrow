import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Title from "./Title";
import ActionsCell from "./ActionsCell";

const Escrows = ({ escrows, reload, signer, account }) => {
  return (
    <React.Fragment>
      <Title>Escrows</Title>
      {!!escrows.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Beneficiary</TableCell>
              <TableCell>Depositor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          {!!escrows.length && (
            <TableBody>
              {escrows.map((escrow, index) => (
                <TableRow key={`${escrow[0]}${escrow[1]}`}>
                  <TableCell>{`${escrow[0].slice(0, 5)}...${escrow[0].slice(
                    -5
                  )}`}</TableCell>
                  <TableCell>
                    {`${escrow[1].slice(0, 5)}...${escrow[1].slice(-5)}`}
                  </TableCell>
                  <TableCell>{Number(escrow[2])}</TableCell>
                  <TableCell>{escrow[3]}</TableCell>
                  <TableCell align="right">
                    <ActionsCell
                      reload={reload}
                      signer={signer}
                      id={index + 1}
                      escrow={escrow}
                      account={account}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      )}
    </React.Fragment>
  );
};

export default Escrows;
