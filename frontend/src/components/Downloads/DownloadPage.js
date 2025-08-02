import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Link,
  List,
  ListItem,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const DownloadPage = () => {
  const { sessionId } = useParams();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`/api/downloads/${sessionId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch downloads");
        }
        const data = await res.json();

        // data.downloadLinks is an array of signed URLs (strings)
        setDownloads(data.downloadLinks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [sessionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10} color="error.main">
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!downloads.length) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5">No downloads available.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Your Downloads
      </Typography>

      <List>
        {downloads.map((url, idx) => {
          // Try to infer file name from URL (optional)
          const fileName = url.split("?")[0].split("/").pop();
          return (
            <ListItem key={idx} divider>
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                download={fileName}
              >
                Download {fileName || `File ${idx + 1}`}
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
};

export default DownloadPage;
