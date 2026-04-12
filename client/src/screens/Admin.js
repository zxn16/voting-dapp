import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

import Candidate from "../components/CandidateCard";
import CandidateForm from "../components/CandidateForm";
import VotersForm from "../components/VotersForm";

export default function Admin({ contract, currentAccount }) {
  const [electionState, setElectionState] = useState(0);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [electionTitle, setElectionTitle] = useState("");
  const [electionStartDate, setElectionStartDate] = useState("");
  const [electionEndDate, setElectionEndDate] = useState("");

  const [savedElectionTitle, setSavedElectionTitle] = useState("");
  const [savedElectionStartDate, setSavedElectionStartDate] = useState(0);
  const [savedElectionEndDate, setSavedElectionEndDate] = useState(0);

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
    setSavedElectionTitle(details[0]);
    setSavedElectionStartDate(Number(details[1]));
    setSavedElectionEndDate(Number(details[2]));
  };

  const getWinner = () => {
    if (candidates.length === 0) return null;

    let winner = candidates[0];

    for (let i = 1; i < candidates.length; i++) {
      if (Number(candidates[i].votes) > Number(winner.votes)) {
        winner = candidates[i];
      }
    }

    return winner;
  };

  const getTotalVotes = () => {
    return candidates.reduce((sum, c) => sum + Number(c.votes || 0), 0);
  };

  const refreshData = async () => {
    await getElectionState();
    await getElectionDetails();
    await getCandidates();
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [contract]);

  const handleEnd = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = async () => {
    try {
      if (electionState === 0) {
        await contract.methods.startElection().send({ from: currentAccount });
        setMessage("Election started successfully");
      } else if (electionState === 1) {
        await contract.methods.endElection().send({ from: currentAccount });
        setMessage("Election ended successfully");
      }

      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Transaction failed");
    }

    setOpen(false);
  };

  const handleSaveElectionSettings = async (event) => {
    event.preventDefault();

    try {
      if (!electionTitle.trim()) {
        setMessage("Election title is required");
        return;
      }

      if (!electionStartDate || !electionEndDate) {
        setMessage("Start and end dates are required");
        return;
      }

      const startTimestamp = Math.floor(
        new Date(electionStartDate).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(electionEndDate).getTime() / 1000
      );

      await contract.methods
        .configureElection(electionTitle, startTimestamp, endTimestamp)
        .send({ from: currentAccount });

      setMessage("Election settings saved successfully");
      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to save election settings");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box>
          {message && (
            <Alert sx={{ mb: 3 }} severity="info">
              {message}
            </Alert>
          )}

          <Grid container sx={{ mt: 0 }} spacing={4}>
            <Grid item xs={12}>
              <Typography align="center" variant="h6" color="textSecondary">
                ELECTION STATUS :{" "}
                {electionState === 0 && "Election has not started."}
                {electionState === 1 && "Election is in progress."}
                {electionState === 2 && "Election has ended."}
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  maxWidth: 900,
                  mx: "auto",
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                  boxShadow: 4,
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                  Election Details
                </Typography>

                <Typography sx={{ mb: 1 }}>
                  <strong>Title:</strong> {savedElectionTitle || "-"}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  <strong>Start Date:</strong>{" "}
                  {formatDate(savedElectionStartDate)}
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  <strong>End Date:</strong> {formatDate(savedElectionEndDate)}
                </Typography>

                {electionState === 0 && (
                  <Box component="form" onSubmit={handleSaveElectionSettings}>
                    <Stack spacing={2}>
                      <TextField
                        label="Election Title"
                        value={electionTitle}
                        onChange={(e) => setElectionTitle(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Start Date"
                        type="datetime-local"
                        value={electionStartDate}
                        onChange={(e) => setElectionStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="End Date"
                        type="datetime-local"
                        value={electionEndDate}
                        onChange={(e) => setElectionEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        type="submit"
                        sx={{
                          borderRadius: 3,
                          fontWeight: "bold",
                          px: 4,
                          py: 1.5,
                        }}
                      >
                        Save Election Settings
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Grid>

            {electionState !== 2 && (
              <Grid item xs={12} sx={{ display: "flex" }}>
                <Button
                  variant="contained"
                  sx={{
                    width: "40%",
                    margin: "auto",
                    borderRadius: 3,
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                  }}
                  onClick={handleEnd}
                >
                  {electionState === 0 && "Start Election"}
                  {electionState === 1 && "End Election"}
                </Button>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography align="center" variant="h6" sx={{ fontWeight: 700 }}>
                {electionState === 0 && "ADD VOTERS / CANDIDATES"}
                {electionState === 1 && "SEE LIVE RESULTS"}
                {electionState === 2 && "FINAL ELECTION RESULT"}
              </Typography>
              <Divider />
            </Grid>

            {electionState === 0 && (
              <>
                <Grid
                  item
                  xs={12}
                  sx={{
                    overflowY: "hidden",
                    overflowX: "auto",
                    display: "flex",
                    width: "98vw",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <VotersForm
                      contract={contract}
                      currentAccount={currentAccount}
                      onSuccess={refreshData}
                      setMessage={setMessage}
                    />
                    <CandidateForm
                      contract={contract}
                      currentAccount={currentAccount}
                      onSuccess={refreshData}
                      setMessage={setMessage}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography align="center" variant="h6" sx={{ fontWeight: 700 }}>
                    CURRENT CANDIDATES
                  </Typography>
                  <Divider />
                </Grid>

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
                  {candidates.length === 0 ? (
                    <Typography align="center">
                      No candidates added yet.
                    </Typography>
                  ) : (
                    candidates.map((candidate) => (
                      <Box sx={{ mx: 2, my: 2 }} key={candidate.id}>
                        <Candidate
                          id={candidate.id}
                          name={candidate.name}
                          party={candidate.party}
                          manifesto={candidate.manifesto}
                          voteCount={null}
                          totalVotes={getTotalVotes()}
                        />
                      </Box>
                    ))
                  )}
                </Grid>
              </>
            )}

            {electionState > 0 && (
              <>
                {electionState === 2 && getWinner() && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", color: "#4caf50" }}
                      >
                        🏆 Winner: {getWinner().name}
                      </Typography>
                      <Typography variant="body1">
                        Total Votes: {getTotalVotes()}
                      </Typography>
                    </Box>
                  </Grid>
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
                        voteCount={candidate.votes}
                        totalVotes={getTotalVotes()}
                      />
                    </Box>
                  ))}
                </Grid>
              </>
            )}
          </Grid>

          <Dialog open={open} onClose={handleClose}>
            <DialogContent>
              <DialogContentText>
                {electionState === 0 && "Do you want to start the election?"}
                {electionState === 1 && "Do you want to end the election?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Disagree</Button>
              <Button onClick={handleAgree} autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}