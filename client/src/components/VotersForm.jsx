import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/material";

export default function VotersForm({
  contract,
  currentAccount,
  onSuccess,
  setMessage,
}) {
  const [walletAddress, setWalletAddress] = useState("");

  const handleForm = async (event) => {
    event.preventDefault();

    try {
      if (!walletAddress.trim()) {
        setMessage("Wallet address is required");
        return;
      }

      await contract.methods
        .addVoter(walletAddress)
        .send({ from: currentAccount });

      setMessage("Voter added successfully");
      setWalletAddress("");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to add voter");
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        width: "40%",
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleForm}
    >
      <Stack spacing={2}>
        <TextField
          label="Voter Address"
          variant="outlined"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Add Voter
        </Button>
      </Stack>
    </Box>
  );
}