import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/material";

export default function CandidateForm({
  contract,
  currentAccount,
  onSuccess,
  setMessage,
}) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [manifesto, setManifesto] = useState("");

  const handleForm = async (event) => {
    event.preventDefault();

    try {
      if (!name.trim()) {
        setMessage("Candidate name is required");
        return;
      }

      await contract.methods
        .addCandidate(name, party, manifesto)
        .send({ from: currentAccount });

      setMessage("Candidate added successfully");
      setName("");
      setParty("");
      setManifesto("");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to add candidate");
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
          label="Candidate Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Party"
          variant="outlined"
          value={party}
          onChange={(e) => setParty(e.target.value)}
        />
        <TextField
          label="Manifesto / Description"
          variant="outlined"
          multiline
          rows={4}
          value={manifesto}
          onChange={(e) => setManifesto(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Add Candidate
        </Button>
      </Stack>
    </Box>
  );
}