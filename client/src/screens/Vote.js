import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import Candidate from "../components/CandidateCard";

export default function Vote({ contract, currentAccount }) {
  const [candidates, setCandidates] = useState([]);
  const [vote, setVote] = useState("");
  const [electionState, setElectionState] = useState(0);
  const [message, setMessage] = useState("");
  const [electionTitle, setElectionTitle] = useState("");
  const [electionStartDate, setElectionStartDate] = useState(0);
  const [electionEndDate, setElectionEndDate] = useState(0);

  const getCandidates = async () => {
    if (!contract) return;

    const count = await contract.methods.candidatesCount().call();
    const temp = [];

    for (let i = 0; i < Number(count); i++) {
      const candidate = await contract.methods.getCandidateDetails(i).call();
      temp.push({
        id: candidate[0],
        name: candidate[1],
        party: candidate[2],
        manifesto: candidate[3],
        votes: candidate[4],
      });
    }

    setCandidates(temp);
  };

  const getElectionState = async () => {
    if (!contract) return;
    const state = await contract.methods.electionState().call();
    setElectionState(Number(state));
  };

  const getElectionDetails = async () => {
    if (!contract) return;
    const details = await contract.methods.getElectionDetails().call();
    setElectionTitle(details[0]);
    setElectionStartDate(Number(details[1]));
    setElectionEndDate(Number(details[2]));
  };

  useEffect(() => {
    getElectionState();
    getElectionDetails();
    getCandidates();
  }, [contract]);

  const handleVoteChange = (event) => {
    setVote(event.target.value);
  };

  const handleVote = async (event) => {
    event.preventDefault();

    try {
      if (vote === "") {
        setMessage("Please select a candidate");
        return;
      }

      await contract.methods.vote(vote).send({ from: currentAccount });
      setMessage("Vote cast successfully");
      await getCandidates();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Voting failed");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.04)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          {electionTitle || "Election"}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Start Date:</strong> {formatDate(electionStartDate)}
        </Typography>
        <Typography>
          <strong>End Date:</strong> {formatDate(electionEndDate)}
        </Typography>
      </Box>

      <form onSubmit={handleVote}>
        <Grid container sx={{ mt: 0 }} spacing={6} justifyContent="center">
          <Grid item xs={12}>
            <Typography align="center" variant="h6">
              {electionState === 0 &&
                "Please wait. Election has not started yet."}
              {electionState === 1 && "VOTE FOR YOUR FAVOURITE CANDIDATE"}
              {electionState === 2 &&
                "Election has ended. See the results below."}
            </Typography>
            <Divider />
          </Grid>

          {message && (
            <Grid item xs={12} md={8}>
              <Alert severity="info">{message}</Alert>
            </Grid>
          )}

          {electionState === 1 && (
            <>
              <Grid item xs={12}>
                <FormControl sx={{ width: "100%" }}>
                  <RadioGroup
                    row
                    value={vote}
                    onChange={handleVoteChange}
                    sx={{
                      justifyContent: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    {candidates.map((candidate) => (
                      <FormControlLabel
                        key={candidate.id}
                        value={String(candidate.id)}
                        control={<Radio />}
                        label={`${candidate.name} (${candidate.party || "Independent"})`}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button variant="contained" type="submit">
                  Submit Vote
                </Button>
              </Grid>
            </>
          )}

          <Grid
            item
            xs={12}
            sx={{
              overflowY: "hidden",
              overflowX: "auto",
              display: "flex",
              width: "98vw",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {candidates.map((candidate) => (
              <Box sx={{ mx: 2, my: 2 }} key={candidate.id}>
                <Candidate
                  id={candidate.id}
                  name={candidate.name}
                  party={candidate.party}
                  manifesto={candidate.manifesto}
                  voteCount={electionState === 2 ? candidate.votes : null}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}