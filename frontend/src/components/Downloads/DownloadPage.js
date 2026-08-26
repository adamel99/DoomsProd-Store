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
import DownloadIcon from "@mui/icons-material/Download";

const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={(theme) => ({
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "28px",
      boxShadow: theme.custom.clay.raised,
      ...sx,
    })}
    {...rest}
  >
    {children}
  </Box>
);

const normalizeDownload = (download, index) => {
  if (typeof download === "string") {
    return {
      url: download,
      label: `File ${index + 1}`,
      fileName: decodeURIComponent(download.split("?")[0].split("/").pop() || `file-${index + 1}`),
    };
  }

  return {
    url: download.url,
    label: download.type ? download.type.toUpperCase() : `File ${index + 1}`,
    fileName: download.type ? `download.${download.type}` : `file-${index + 1}`,
  };
};

const DownloadPage = () => {
  const { sessionId } = useParams();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`/api/downloads/${sessionId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch downloads");
        }
        const data = await res.json();
        setDownloads(data.downloadLinks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [sessionId]);

  const centerState = (content) => (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <GlassPanel sx={{ p: { xs: 4, md: 5 }, textAlign: "center", minWidth: { xs: 280, sm: 360 } }}>
        {content}
      </GlassPanel>
    </Box>
  );

  if (loading) {
    return centerState(<CircularProgress color="primary" />);
  }

  if (error) {
    return centerState(
      <Typography variant="h6" sx={{ color: "primary.dark" }}>
        {error}
      </Typography>
    );
  }

  if (!downloads.length) {
    return centerState(
      <Typography variant="h5" sx={{ color: "text.primary" }}>
        No downloads available.
      </Typography>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <GlassPanel sx={{ p: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Your Downloads
          </Typography>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Your purchased files are ready.
          </Typography>

          <List disablePadding>
            {downloads.map((download, idx) => {
              const { url, label, fileName } = normalizeDownload(download, idx);
              return (
                <ListItem key={idx} disableGutters sx={{ mb: 1.5 }}>
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    sx={(theme) => ({
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      px: 2,
                      py: 1.4,
                      borderRadius: "16px",
                      background: theme.custom.clay.surfaceSoft,
                      border: theme.custom.clay.border,
                      boxShadow: theme.custom.clay.raisedSmall,
                      color: "primary.main",
                      fontWeight: 800,
                      textDecoration: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        color: "primary.dark",
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.custom.clay.floating,
                      },
                    })}
                  >
                    <DownloadIcon fontSize="small" />
                    Download {label}
                  </Link>
                </ListItem>
              );
            })}
          </List>
        </GlassPanel>
      </Container>
    </Box>
  );
};

export default DownloadPage;
