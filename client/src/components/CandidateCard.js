import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";

export default function CandidateCard({
  name,
  party,
  manifesto,
  voteCount,
}) {
  const IMG =
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=1400";

  return (
    <Card sx={{ maxWidth: 345, minWidth: 300 }}>
      <CardHeader
        title={
          <Typography align="center" variant="subtitle1" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
        }
        subheader={
          <Typography align="center" variant="body2">
            {party || "Independent"}
          </Typography>
        }
      />
      <CardContent sx={{ padding: 0 }}>
        <CardMedia component="img" alt={name} height="140" image={IMG} />
      </CardContent>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {manifesto || "No manifesto provided."}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "center", minHeight: 48 }}>
        {voteCount !== null && voteCount !== undefined ? (
          <Typography align="center">
            <strong>{voteCount}</strong> votes
          </Typography>
        ) : (
          <Typography align="center">Candidate</Typography>
        )}
      </CardActions>
    </Card>
  );
}