import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Stack,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";

const ContactModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Contact Me
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#999" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <DialogContentText>
          For Exclusive licenses, custom beats, or general inquiries, reach out directly:
        </DialogContentText>

        <Box mt={2}>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon color="primary" />
              <Typography variant="body1">
                <Link href="mailto:adamelh1999@gmail.com" underline="hover">
                  adamelh1999@gmail.com
                </Link>
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <InstagramIcon color="secondary" />
              <Typography variant="body1">
                <Link href="https://instagram.com/vdam_" target="_blank" underline="hover">
                  @vdam_
                </Link>
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <YouTubeIcon color="error" />
              <Typography variant="body1">
                <Link href="https://www.youtube.com/@DoomsProduction" target="_blank" underline="hover">
                  YouTube Channel
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
