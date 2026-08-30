import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import { formatProductType } from "../../utils/formatProductType";
import { useAudioPlayer } from "../../context/AudioPlayer";

const ProductCard = ({ customProduct, viewMode = "grid" }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { activeTrackId, isPlaying, toggleTrack } = useAudioPlayer();

  const licenses = useSelector((state) => Object.values(state.licenses.licenses || {}));
  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [addCartError, setAddCartError] = useState(null);
  const [addCartSuccess, setAddCartSuccess] = useState(false);

  const product = customProduct;

  useEffect(() => {
    if (product?.type === "beat") dispatch(getAllLicensesThunk());
  }, [dispatch, product]);

  if (!product) return null;

  const { id, title, price, description, imageUrl, audioPreviewUrl, type, genre, bpm, key: productKey, artistTags } = product;
  const isList = viewMode === "list";
  const isCurrentTrackPlaying = activeTrackId === id && isPlaying;

  const toggleAudio = (e) => {
    e.stopPropagation();
    toggleTrack({
      id,
      title,
      imageUrl,
      audioPreviewUrl,
      type,
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAddCartError(null);
    setAddCartSuccess(false);

    if (type === "beat" && !selectedLicenseId) {
      if (!isList) {
        history.push(`/products/${id}`);
        return;
      }
      setAddCartError("Select a license first.");
      return;
    }

    setAddCartLoading(true);
    try {
      await dispatch(addToCartThunk(id, selectedLicenseId || null));
      setAddCartSuccess(true);
      setTimeout(() => setAddCartSuccess(false), 2600);
    } catch {
      setAddCartError("Could not add to cart.");
    } finally {
      setAddCartLoading(false);
    }
  };

  return (
    <Box
      onClick={() => history.push(`/products/${id}`)}
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        minWidth: 0,
        display: "grid",
        gridTemplateColumns: isList ? { xs: "1fr", md: "190px minmax(0, 1fr)" } : "1fr",
        gridTemplateRows: isList ? { xs: "170px auto", md: "210px" } : "210px 290px",
        minHeight: isList ? { xs: 0, md: 190 } : 490,
        maxHeight: isList ? "none" : 500,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "16px",
        background: theme.custom.clay.surfaceSoft,
        border: theme.custom.clay.border,
        boxShadow: theme.custom.clay.raised,
        transition: theme.custom.motion.transition.lift,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.custom.clay.floating,
          borderColor: theme.custom.transparent(theme.palette.primary.main, 0.33),
        },
      })}
    >
      <Box sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        height: "100%",
        minHeight: isList ? { xs: 170, md: 190 } : 210,
        overflow: "hidden",
        background: (theme) => theme.custom.gradients.surfaceCool,
      }}>
        <Box
          component="img"
          src={imageUrl || "/placeholder.jpg"}
          alt={title}
          loading="lazy"
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            height: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
            transition: (theme) => theme.custom.motion.transition.media,
            ".MuiBox-root:hover > &": { transform: "scale(1.02)" },
          }}
        />
        <Box sx={{
          position: "absolute",
          inset: 0,
          background: (theme) => theme.custom.gradients.imageScrim,
          opacity: 0.48,
          pointerEvents: "none",
        }} />

        <Box sx={(theme) => ({
          position: "absolute",
          top: 12,
          left: 12,
          px: 1.1,
          py: 0.45,
          borderRadius: "999px",
          background: theme.custom.transparent(theme.custom.colors.clay, 0.92),
          border: `1px solid ${theme.custom.transparent(theme.palette.primary.main, 0.28)}`,
          boxShadow: theme.custom.clay.raisedSmall,
        })}>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.mono,
            fontSize: "0.57rem",
            fontWeight: 700,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "text.primary",
          }}>
            {formatProductType(type)}
          </Typography>
        </Box>

        {audioPreviewUrl && (
          <>
            <IconButton
              onClick={toggleAudio}
              aria-label={isCurrentTrackPlaying ? "Pause preview" : "Play preview"}
              sx={(theme) => ({
                position: "absolute",
                left: 14,
                bottom: 14,
                width: 38,
                height: 38,
                color: "primary.main",
                background: theme.custom.clay.surfaceSoft,
                border: `1px solid ${theme.custom.transparent(theme.palette.primary.main, 0.3)}`,
                boxShadow: theme.custom.clay.raisedSmall,
                transition: theme.custom.motion.transition.interactive,
                "&:hover": {
                  color: "primary.contrastText",
                  background: theme.custom.gradients.brandSoft,
                },
              })}
            >
              {isCurrentTrackPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" sx={{ ml: 0.25 }} />}
            </IconButton>
          </>
        )}
      </Box>

      <Box sx={{
        p: { xs: 2, md: isList ? 2 : 2 },
        display: "flex",
        flexDirection: "column",
        gap: isList ? 1 : 1.25,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}>
        <Box>
          <Typography variant="h4" sx={{
            fontSize: { xs: "1.05rem", md: isList ? "1.25rem" : "1.08rem" },
            lineHeight: 1.18,
            mb: 0.75,
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {title}
          </Typography>

          {description && (
            <Typography sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
              lineHeight: 1.45,
              overflowWrap: "anywhere",
              display: "-webkit-box",
              WebkitLineClamp: isList ? 2 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {description}
            </Typography>
          )}
        </Box>

        {(genre || bpm || productKey || artistTags) && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", minWidth: 0 }}>
            {genre && <MetaPill>{genre}</MetaPill>}
            {bpm && <MetaPill>{bpm} BPM</MetaPill>}
            {productKey && <MetaPill>{productKey}</MetaPill>}
            {artistTags && <MetaPill>{artistTags.split(",")[0]}</MetaPill>}
          </Box>
        )}

        {type === "beat" && licenses.length > 0 && (
          <FormControl
            size="small"
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: isList ? "flex" : "none",
              width: { xs: "100%", md: 320 },
              maxWidth: "100%",
            }}
          >
            <InputLabel>License</InputLabel>
            <Select
              value={selectedLicenseId}
              label="License"
              onChange={(e) => setSelectedLicenseId(e.target.value)}
            >
              <MenuItem value=""><em>Choose license</em></MenuItem>
              {licenses.map((license) => (
                <MenuItem key={license.id} value={license.id}>
                  {license.name} - ${license.price}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {addCartError && (
          <Typography sx={{ color: "primary.dark", fontSize: "0.82rem" }}>
            {addCartError}
          </Typography>
        )}

        <Box sx={{
          mt: "auto",
          pt: 0.5,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 1.25,
          alignItems: "center",
          minWidth: 0,
        }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              color: "text.disabled",
              fontSize: "0.62rem",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              mb: 0.3,
            }}>
              From
            </Typography>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "text.primary",
              lineHeight: 1,
            }}>
              ${price}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 0.75 }}>
            <IconButton
              aria-label="View details"
              onClick={(e) => { e.stopPropagation(); history.push(`/products/${id}`); }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Add to cart"
              onClick={handleAddToCart}
              disabled={addCartLoading}
              sx={(theme) => ({
                color: addCartSuccess ? "success.main" : "primary.main",
                borderColor: addCartSuccess
                  ? theme.custom.transparent(theme.palette.success.main, 0.38)
                  : theme.custom.transparent(theme.palette.primary.main, 0.28),
                background: addCartSuccess
                  ? theme.custom.transparent(theme.palette.success.main, 0.12)
                  : theme.custom.transparent(theme.palette.primary.main, 0.09),
              })}
            >
              {addCartSuccess ? <CheckCircleIcon fontSize="small" /> : <ShoppingCartIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const MetaPill = ({ children }) => (
  <Box sx={(theme) => ({
    px: 1.3,
    py: 0.55,
    minWidth: 0,
    maxWidth: "100%",
    borderRadius: "999px",
    background: theme.custom.transparent(theme.custom.colors.clay, 0.54),
    border: theme.custom.clay.hairline,
  })}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.62rem",
      letterSpacing: "1px",
      color: "text.secondary",
      textTransform: "uppercase",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}>
      {children}
    </Typography>
  </Box>
);

export default ProductCard;
