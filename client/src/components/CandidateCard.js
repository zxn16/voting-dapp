import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

export default function CandidateCard({
  name,
  party,
  manifesto,
  voteCount,
  totalVotes = 0,
}) {
  const IMG =
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=1400";

  const percentage =
    totalVotes > 0 && voteCount !== null && voteCount !== undefined
      ? ((Number(voteCount) / totalVotes) * 100).toFixed(1)
      : 0;

  return (
    <Card
      sx={{
        maxWidth: 345,
        minWidth: 300,
        borderRadius: 3,
        boxShadow: 5,
        transition: "0.3s",
        "&:hover": {
          transform: "scale(1.03)",
        },
      }}
    >
      <CardHeader
        title={
          <Typography align="center" variant="h6" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
        }
        subheader={
          <Typography align="center" variant="body2">
            {party || "Independent"}
          </Typography>
        }
      />

      <CardMedia component="img" height="140" image={IMG} alt={name} />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {manifesto || "No manifesto provided."}
        </Typography>
      </CardContent>

      {voteCount !== null && voteCount !== undefined && (
        <CardContent>
          <Typography align="center" sx={{ fontWeight: "bold" }}>
            {voteCount} votes ({percentage}%)
          </Typography>

          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Number(percentage)}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
        </CardContent>
      )}

      <CardActions sx={{ justifyContent: "center" }}>
        <Typography variant="caption">Candidate</Typography>
      </CardActions>
    </Card>
  );
}