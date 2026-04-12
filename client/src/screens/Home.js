import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VotingContract from "../contracts/Voting.json";
import Web3 from "web3";

import Vote from "./Vote";
import Admin from "./Admin";

export default function Home() {
  const [role, setRole] = useState(3);
  const [web3, setWeb3] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Connecting wallet...");
  const [adminAddress, setAdminAddress] = useState("");

  const loadWeb3 = async () => {
    try {
      if (!window.ethereum) {
        setStatusMessage("MetaMask not detected");
        setLoading(false);
        return;
      }

      const provider = window.ethereum;

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x539" }],
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

          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x539" }],
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

      const web3Instance = new Web3(provider);

      let deployedNetwork = null;

      if (chainId === "0x539") {
        deployedNetwork = VotingContract.networks?.["5777"];
      } else {
        deployedNetwork = VotingContract.networks?.[netVersion];
      }

      if (!deployedNetwork) {
        setStatusMessage(
          `Contract not deployed on current network. chainId=${chainId}, netVersion=${netVersion}`
        );
        setLoading(false);
        return;
      }

      const instance = new web3Instance.eth.Contract(
        VotingContract.abi,
        deployedNetwork.address
      );

      const current = accounts[0];
      const admin = await instance.methods.admin().call();
      const userRole = await instance.methods.getRole(current).call();

      setWeb3(web3Instance);
      setCurrentAccount(current);
      setContract(instance);
      setAdminAddress(admin);
      setRole(Number(userRole));
      setStatusMessage("Connected successfully");
      setLoading(false);

      provider.on("accountsChanged", () => window.location.reload());
      provider.on("chainChanged", () => window.location.reload());
    } catch (error) {
      console.error("Error loading app:", error);
      setStatusMessage(error.message || "Failed to connect");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        px: 3,
        py: 4,
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box>
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
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              Blockchain Voting DApp
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Connected Wallet:</strong> {currentAccount || "-"}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Admin Wallet:</strong> {adminAddress || "-"}
            </Typography>

            <Typography>
              <strong>Status:</strong> {statusMessage}
            </Typography>
          </Box>

          {role === 1 && (
            <Admin
              role={role}
              contract={contract}
              web3={web3}
              currentAccount={currentAccount}
            />
          )}

          {role === 2 && (
            <Vote
              role={role}
              contract={contract}
              web3={web3}
              currentAccount={currentAccount}
            />
          )}

          {role === 3 && (
            <Box
              sx={{
                maxWidth: 900,
                mx: "auto",
                p: 4,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.04)",
              }}
            >
              <Typography variant="h6" align="center">
                Unauthorized User
              </Typography>
              <Typography align="center" sx={{ mt: 1 }}>
                Ask the admin to register your wallet before you can vote.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}