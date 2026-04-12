import { useEffect, useState } from "react";
import Web3 from "web3";
import VotingContract from "../contracts/Voting.json";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [admin, setAdmin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [electionTitle, setElectionTitle] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [electionStatus, setElectionStatus] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateManifesto, setCandidateManifesto] = useState("");

  const [voterAddress, setVoterAddress] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

 useEffect(() => {
  const init = async () => {
    try {
      if (!window.ethereum) {
        setMessage("MetaMask not detected");
        setLoading(false);
        return;
      }

      const provider = window.ethereum;

      console.log("window.ethereum:", provider);
      console.log("isMetaMask:", provider.isMetaMask);
      console.log("selectedAddress:", provider.selectedAddress);

      try {
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x539" }], // 1337 in hex
  });
} catch (switchError) {
  if (switchError.code === 4902) {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x539",
          chainName: "Ganache Local",
          rpcUrls: ["http://127.0.0.1:7545"],
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
        },
      ],
    });
  } else {
    throw switchError;
  }
}

const accounts = await provider.request({
  method: "eth_requestAccounts",
});

      const chainId = await provider.request({ method: "eth_chainId" });
      const netVersion = await provider.request({ method: "net_version" });

      console.log("Detected chain id:", chainId);
      console.log("Detected net_version:", netVersion);
      console.log(
        "Available contract networks:",
        Object.keys(VotingContract.networks || {})
      );

      const web3 = new Web3(provider);

      let deployedNetwork = null;

      if (chainId === "0x539") {
        deployedNetwork = VotingContract.networks?.["5777"];
      } else {
        deployedNetwork = VotingContract.networks?.[netVersion];
      }

      if (!deployedNetwork) {
        setMessage(
          `Contract not deployed on current network. chainId=${chainId}, net_version=${netVersion}`
        );
        setLoading(false);
        return;
      }

      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork.address
      );

      console.log("Using contract address:", deployedNetwork.address);
      console.log("Contract name from JSON:", VotingContract.contractName);
      console.log("Available methods:", Object.keys(instance.methods));

      const currentAccount = accounts[0];
      const adminAddress = await instance.methods.admin().call();

      setAccount(currentAccount);
      setContract(instance);
      setAdmin(adminAddress);
      setIsAdmin(adminAddress.toLowerCase() === currentAccount.toLowerCase());
      setMessage("Connected successfully");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to connect");
      setLoading(false);
    }
  };

  init();
}, []);

  const reloadData = async () => {
    try {
      if (!contract || !account) return;

      const adminAddress = await contract.methods.admin().call();
      const title = await contract.methods.electionTitle().call();
      const status = await contract.methods.getElectionStatus().call();
      const count = await contract.methods.candidatesCount().call();

      const loadedCandidates = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await contract.methods.getCandidate(i).call();
        loadedCandidates.push({
          id: candidate[0],
          name: candidate[1],
          party: candidate[2],
          manifesto: candidate[3],
          voteCount: candidate[4],
        });
      }

      setAdmin(adminAddress);
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
      setElectionTitle(title);
      setTitleInput(title);
      setElectionStatus(status);
      setCandidates(loadedCandidates);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to reload contract data.");
    }
  };

  const configureElection = async () => {
    try {
      const startUnix = Math.floor(new Date(startInput).getTime() / 1000);
      const endUnix = Math.floor(new Date(endInput).getTime() / 1000);

      await contract.methods
        .configureElection(titleInput, startUnix, endUnix)
        .send({ from: account });

      setMessage("Election configured successfully.");
      reloadData();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const addCandidate = async () => {
    try {
      await contract.methods
        .addCandidate(candidateName, candidateParty, candidateManifesto)
        .send({ from: account });

      setCandidateName("");
      setCandidateParty("");
      setCandidateManifesto("");
      setMessage("Candidate added successfully.");
      reloadData();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const registerVoter = async () => {
    try {
      await contract.methods.registerVoter(voterAddress).send({ from: account });
      setVoterAddress("");
      setMessage("Voter registered successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const startElection = async () => {
    try {
      await contract.methods.startElection().send({ from: account });
      setMessage("Election started.");
      reloadData();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const endElection = async () => {
    try {
      await contract.methods.endElection().send({ from: account });
      setMessage("Election ended.");
      reloadData();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const vote = async () => {
    try {
      await contract.methods.vote(selectedCandidateId).send({ from: account });
      setMessage("Vote cast successfully.");
      reloadData();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px", color: "black" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", color: "black" }}>
      <h1>{electionTitle || "Blockchain Voting DApp"}</h1>

      <div style={cardStyle}>
        <p><strong>Connected Wallet:</strong> {account}</p>
        <p><strong>Admin Wallet:</strong> {admin}</p>
        <p><strong>Status:</strong> {electionStatus}</p>
        {message && <p>{message}</p>}
      </div>

      {isAdmin && (
        <div style={cardStyle}>
          <h2>Admin Panel</h2>

          <h3>Configure Election</h3>
          <input
            style={inputStyle}
            type="text"
            placeholder="Election title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <input
            style={inputStyle}
            type="datetime-local"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
          />
          <input
            style={inputStyle}
            type="datetime-local"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
          />
          <button style={buttonStyle} onClick={configureElection}>Save Election Settings</button>

          <hr style={{ margin: "20px 0" }} />

          <h3>Add Candidate</h3>
          <input
            style={inputStyle}
            type="text"
            placeholder="Candidate name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <input
            style={inputStyle}
            type="text"
            placeholder="Party"
            value={candidateParty}
            onChange={(e) => setCandidateParty(e.target.value)}
          />
          <textarea
            style={textAreaStyle}
            placeholder="Manifesto / description"
            value={candidateManifesto}
            onChange={(e) => setCandidateManifesto(e.target.value)}
          />
          <button style={buttonStyle} onClick={addCandidate}>Add Candidate</button>

          <hr style={{ margin: "20px 0" }} />

          <h3>Register Voter</h3>
          <input
            style={inputStyle}
            type="text"
            placeholder="Wallet address"
            value={voterAddress}
            onChange={(e) => setVoterAddress(e.target.value)}
          />
          <button style={buttonStyle} onClick={registerVoter}>Register Voter</button>

          <hr style={{ margin: "20px 0" }} />

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={startElection}>Start Election</button>
            <button style={{ ...buttonStyle, background: "#c62828" }} onClick={endElection}>
              End Election
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h2>Candidates</h2>

        {candidates.length === 0 ? (
          <p>No candidates added yet.</p>
        ) : (
          <div style={gridStyle}>
            {candidates.map((candidate) => (
              <div key={candidate.id} style={candidateCardStyle}>
                <h3>{candidate.name}</h3>
                <p><strong>Party:</strong> {candidate.party}</p>
                <p>{candidate.manifesto}</p>
                <p><strong>Votes:</strong> {candidate.voteCount}</p>

                {electionStatus === "Active" && !isAdmin && (
                  <button
                    style={buttonStyle}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                  >
                    Select Candidate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {electionStatus === "Active" && !isAdmin && candidates.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <button style={buttonStyle} onClick={vote}>Confirm Vote</button>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#f3f3f3",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "16px",
};

const candidateCardStyle = {
  background: "#e9e9e9",
  padding: "16px",
  borderRadius: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const textAreaStyle = {
  ...inputStyle,
  minHeight: "100px",
  resize: "vertical",
};

const buttonStyle = {
  background: "#1976d2",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
};