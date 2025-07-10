import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { getAllLicensesThunk } from "../../store/licenses";
import ContactModal from "../ContactInfo/ContactInfo";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GavelIcon from "@mui/icons-material/Gavel";

const LicensesPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const licenses = useSelector((state) =>
    Object.values(state.licenses.licenses || {})
  );
  const [openContact, setOpenContact] = useState(false);

  useEffect(() => {
    dispatch(getAllLicensesThunk());
  }, [dispatch]);

  const getLicenseDetails = (license) => {
    switch (license.name.toLowerCase()) {
      case "basic":
        return {
          distributionLimit: "Up to 5,000 streams",
          radioPlays: "Not allowed",
          monetization: "Non-commercial use only",
          ownership: "Non-exclusive",
          modifications: "Minor edits allowed",
        };
      case "premium":
        return {
          distributionLimit: "Up to 100,000 streams",
          radioPlays: "Up to 2 stations",
          monetization: "Monetizable on major platforms",
          ownership: "Non-exclusive",
          modifications: "Allowed with credit",
        };
      case "unlimited":
        return {
          distributionLimit: "Unlimited",
          radioPlays: "Unlimited",
          monetization: "Fully monetizable",
          ownership: "Non-exclusive",
          modifications: "Allowed",
        };
      case "exclusive":
        return {
          distributionLimit: "Unlimited",
          radioPlays: "Unlimited",
          monetization: "Fully monetizable",
          ownership: "Exclusive - beat removed from store",
          modifications: "Full creative control",
        };
      default:
        return {
          distributionLimit: "Custom",
          radioPlays: "Custom",
          monetization: "Custom",
          ownership: "Varies",
          modifications: "Varies",
        };
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        py: 10,
        color: theme.palette.text.primary,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          fontWeight={900}
          sx={{ color: theme.palette.primary.main, mb: 6 }}
        >
          Licensing Options
        </Typography>

        <Grid
  container
  spacing={4}
  justifyContent="center"
  alignItems="stretch"
>
  {licenses.map((license) => {
    const details = getLicenseDetails(license);
    const isExclusive = license.name.toLowerCase() === "exclusive";

    return (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        key={license.id}
        sx={{ display: "flex" }} // ⬅ Ensures full height
      >
        <Paper
          elevation={8}
          sx={{
            p: theme.spacing(4),
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            transition: "transform 0.3s ease",
            flexGrow: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {license.name}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: theme.palette.primary.main, mb: 2 }}
            >
              ${license.price}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" sx={{ mb: 1 }}>
              <MusicNoteIcon fontSize="small" sx={{ mr: 1 }} />
              <strong>Distribution Limit:</strong> {details.distributionLimit}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <MusicNoteIcon fontSize="small" sx={{ mr: 1 }} />
              <strong>Radio Plays:</strong> {details.radioPlays}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <MonetizationOnIcon fontSize="small" sx={{ mr: 1 }} />
              <strong>Monetization:</strong> {details.monetization}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Ownership:</strong> {details.ownership}
            </Typography>
            <Typography variant="body1">
              <strong>Modifications:</strong> {details.modifications}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              if (isExclusive) setOpenContact(true);
            }}
            sx={{
              mt: 4,
              borderRadius: 99,
              fontWeight: 600,
              background: isExclusive
                ? "linear-gradient(135deg, #ff4081, #ff6699)"
                : "linear-gradient(135deg, #4caf50, #81c784)",
              "&:hover": {
                background: isExclusive
                  ? "linear-gradient(135deg, #ff6699, #ff4081)"
                  : "linear-gradient(135deg, #66bb6a, #388e3c)",
              },
            }}
          >
            {isExclusive ? "Contact for Purchase" : "Included with Beat"}
          </Button>
        </Paper>
      </Grid>
    );
  })}
</Grid>


        <Box
          mt={10}
          px={4}
          py={6}
          sx={{
            background: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            mt: theme.spacing(12),
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            color="error.main"
            gutterBottom
          >
            <GavelIcon sx={{ mr: 1, mb: "-5px" }} />
            Legal Notice & Copyright
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
            All instrumentals and audio content sold on this platform are protected under copyright law.
            Unauthorized use, reproduction, distribution, or commercial exploitation of any beat without
            a valid license agreement is strictly prohibited. Violation of these terms may result in
            copyright takedowns, legal action, and removal of your content from streaming platforms.
            <br /><br />
            Exclusive licenses remove the beat from the store and grant you full rights for commercial use.
            All licensing agreements are non-transferable. The producer retains copyright ownership unless
            explicitly transferred in a signed agreement.
            <br /><br />
            Sync licensing (use in film, TV, games, or advertising) requires separate written approval.
            Licensing is granted for use as-is; resale of the beat or creating derivative products (e.g. sample kits)
            is not permitted unless explicitly allowed in writing.
          </Typography>
        </Box>
      </Container>

      <ContactModal open={openContact} onClose={() => setOpenContact(false)} />
    </Box>
  );
};

export default LicensesPage;
