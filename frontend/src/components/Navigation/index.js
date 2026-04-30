import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { logout } from '../../store/session';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignUpFormModal from '../SignUpFormModal';
import LoginFormModal from '../LoginFormModal';

const NAV_LINKS = [
  { path: '/products', label: 'Products' },
  { path: '/about', label: 'About' },
  { path: '/licenses', label: 'Licenses' },
];

const iconBtnSx = {
  width: 34, height: 34,
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  color: 'rgba(255,234,236,0.4)',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#FFEAEC',
    borderColor: 'rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
  },
};

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const sessionUser = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) => state.cartItems.allItems || {});
  const cartCount = useMemo(() => Object.keys(cartItems).length, [cartItems]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);           // mobile hamburger
  const [profileAnchorEl, setProfileAnchorEl] = useState(null); // profile dropdown
  const [scrolled, setScrolled] = useState(false);

  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  }, [searchTerm, history]);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setSearchTerm('');
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    history.push('/');
  }, [dispatch, history]);

  const handleMenuOpen = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);
  const handleNav = useCallback((path) => {
    history.push(path);
    handleMenuClose();
  }, [history, handleMenuClose]);

  const handleProfileOpen = useCallback((e) => setProfileAnchorEl(e.currentTarget), []);
  const handleProfileClose = useCallback(() => setProfileAnchorEl(null), []);

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          background: scrolled
            ? 'linear-gradient(180deg, rgba(22,14,18,0.98) 0%, rgba(14,10,13,0.97) 100%)'
            : 'linear-gradient(180deg, rgba(22,14,18,0.82) 0%, rgba(14,10,13,0.78) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled
            ? [
                '0 1px 0 rgba(255,255,255,0.055) inset',
                '0 16px 48px rgba(0,0,0,0.65)',
              ].join(', ')
            : '0 1px 0 rgba(255,255,255,0.035) inset',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Noise grain */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.018, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '128px',
        }} />

        {/* Bottom glow */}
        <Box sx={{
          position: 'absolute', bottom: '-1px',
          left: '50%', transform: 'translateX(-50%)',
          width: scrolled ? '60%' : '30%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(228,63,111,0.7), transparent)',
          opacity: scrolled ? 1 : 0.55,
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }} />

        {/* True three-column grid: logo | center | actions */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          px: { xs: 2, sm: 3, md: 5 },
          height: { xs: 56, sm: 62 },
          gap: 2,
        }}>

          {/* ── Col 1: Logo ── */}
          <Box
            onClick={() => history.push('/')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.1,
              cursor: 'pointer', userSelect: 'none',
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.75 },
              justifySelf: 'start',
            }}
          >
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%',
              bgcolor: '#E43F6F', flexShrink: 0,
              boxShadow: '0 0 8px rgba(228,63,111,1), 0 0 18px rgba(228,63,111,0.5)',
            }} />
            <Typography sx={{
              fontFamily: `"Syne", sans-serif`,
              fontWeight: 800,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: '#FFEAEC',
              letterSpacing: '-0.5px',
            }}>
              doomsprod
            </Typography>
          </Box>

          {/* ── Col 2: Nav links OR search bar — always truly centered ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.div
                  key="search-open"
                  initial={{ width: 200, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 200, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Box
                    component="form"
                    onSubmit={onSearchSubmit}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderTop: '1px solid rgba(255,255,255,0.16)',
                      borderRadius: '100px',
                      pl: 2, pr: 0.75,
                      height: 38,
                      width: '100%',
                      boxShadow: [
                        '4px 4px 14px rgba(0,0,0,0.4)',
                        '-1px -1px 6px rgba(255,255,255,0.02)',
                        'inset 0 1px 0 rgba(255,255,255,0.06)',
                      ].join(', '),
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      '&:focus-within': {
                        borderColor: 'rgba(228,63,111,0.45)',
                        borderTopColor: 'rgba(228,63,111,0.6)',
                        boxShadow: [
                          '4px 4px 14px rgba(0,0,0,0.4)',
                          '0 0 0 3px rgba(228,63,111,0.08)',
                          'inset 0 1px 0 rgba(255,255,255,0.06)',
                        ].join(', '),
                      },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 15, color: 'rgba(255,234,236,0.35)', mr: 1.2, flexShrink: 0 }} />
                    <InputBase
                      placeholder="Search beats, kits, loops…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      sx={{
                        flex: 1,
                        fontFamily: `"DM Sans", sans-serif`,
                        fontSize: '0.875rem',
                        color: '#FFEAEC',
                        '& input::placeholder': { color: 'rgba(255,234,236,0.22)' },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleCloseSearch}
                      sx={{
                        width: 28, height: 28,
                        borderRadius: '100px',
                        color: 'rgba(255,234,236,0.3)',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          color: '#FFEAEC',
                          background: 'rgba(255,255,255,0.07)',
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="nav-links"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  {NAV_LINKS.map(({ path, label }) => (
                    <Button
                      key={path}
                      component={NavLink}
                      to={path}
                      variant="text"
                      sx={{
                        fontFamily: `"DM Sans", sans-serif`,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'rgba(255,234,236,0.4)',
                        textTransform: 'none',
                        px: 2, py: 0.85,
                        minWidth: 'auto',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: '#FFEAEC',
                          background: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.07)',
                        },
                        '&.active': {
                          color: '#E43F6F',
                          fontWeight: 700,
                          background: 'rgba(228,63,111,0.08)',
                          borderColor: 'rgba(228,63,111,0.2)',
                        },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* ── Col 3: Right actions ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', justifySelf: 'end' }}>

            {/* Search icon */}
            <IconButton
              onClick={() => setShowSearch((prev) => !prev)}
              size="small"
              sx={{
                ...iconBtnSx,
                ...(showSearch && {
                  color: '#E43F6F',
                  borderColor: 'rgba(228,63,111,0.3)',
                  background: 'rgba(228,63,111,0.08)',
                }),
              }}
              aria-label="search"
            >
              <SearchIcon sx={{ fontSize: 17 }} />
            </IconButton>

            {/* Cart */}
            <IconButton
              component={NavLink}
              to="/cart"
              size="small"
              sx={{
                ...iconBtnSx,
                '&.active': {
                  color: '#E43F6F',
                  borderColor: 'rgba(228,63,111,0.3)',
                  background: 'rgba(228,63,111,0.08)',
                },
              }}
              aria-label="cart"
            >
              <Badge
                badgeContent={cartCount}
                invisible={cartCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.58rem', height: 14, minWidth: 14,
                    bgcolor: '#E43F6F', color: '#fff',
                    fontFamily: `"DM Sans", sans-serif`, fontWeight: 700,
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 17 }} />
              </Badge>
            </IconButton>

            {/* ── Auth — Desktop ── */}
            {isLoaded && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '6px' }}>

                <Box sx={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', mx: '2px' }} />

                {sessionUser ? (
                  <>
                    {/* Clickable username pill → opens profile dropdown */}
                    <Box
                      onClick={handleProfileOpen}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.9,
                        px: 1.4, height: 34,
                        background: profileOpen
                          ? 'rgba(228,63,111,0.09)'
                          : 'rgba(255,255,255,0.04)',
                        border: '1px solid',
                        borderColor: profileOpen
                          ? 'rgba(228,63,111,0.3)'
                          : 'rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        boxShadow: [
                          '3px 3px 10px rgba(0,0,0,0.3)',
                          '-1px -1px 4px rgba(255,255,255,0.02)',
                          '0 1px 0 rgba(255,255,255,0.05) inset',
                        ].join(', '),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'rgba(228,63,111,0.3)',
                          background: 'rgba(228,63,111,0.07)',
                        },
                      }}
                    >
                      <Avatar sx={{
                        width: 20, height: 20, fontSize: '0.58rem',
                        bgcolor: '#E43F6F', color: '#fff', fontWeight: 700,
                        fontFamily: `"Syne", sans-serif`,
                      }}>
                        {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography sx={{
                        fontFamily: `"DM Sans", sans-serif`,
                        fontSize: '0.8rem', fontWeight: 600,
                        color: 'rgba(255,234,236,0.6)',
                        maxWidth: 88, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sessionUser.username}
                      </Typography>
                    </Box>

                    {/* ── Profile dropdown ── */}
                    <Menu
                      anchorEl={profileAnchorEl}
                      open={profileOpen}
                      onClose={handleProfileClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 220,
                          background: 'rgba(16,11,14,0.97)',
                          backdropFilter: 'blur(32px)',
                          WebkitBackdropFilter: 'blur(32px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderTop: '1px solid rgba(255,255,255,0.13)',
                          borderRadius: '16px',
                          boxShadow: [
                            '0 24px 60px rgba(0,0,0,0.75)',
                            '6px 6px 20px rgba(0,0,0,0.4)',
                            '-2px -2px 8px rgba(255,255,255,0.01)',
                            '0 1px 0 rgba(255,255,255,0.06) inset',
                          ].join(', '),
                          overflow: 'hidden',
                          '& .MuiList-root': { py: 0 },
                        },
                      }}
                    >
                      {/* User info header */}
                      <Box sx={{
                        px: 2.5, py: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                      }}>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: '0.85rem',
                          bgcolor: '#E43F6F', color: '#fff', fontWeight: 700,
                          fontFamily: `"Syne", sans-serif`,
                          boxShadow: '0 4px 12px rgba(228,63,111,0.4)',
                        }}>
                          {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{
                            fontFamily: `"Syne", sans-serif`,
                            fontWeight: 700, fontSize: '0.9rem',
                            color: '#FFEAEC', lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {sessionUser.username}
                          </Typography>
                          <Typography sx={{
                            fontFamily: `"DM Sans", sans-serif`,
                            fontSize: '0.72rem',
                            color: 'rgba(255,234,236,0.35)',
                            lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {sessionUser.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Logout */}
                      <MenuItem
                        onClick={() => {
                          handleProfileClose();
                          handleLogout();
                        }}
                        sx={{
                          fontFamily: `"DM Sans", sans-serif`,
                          fontSize: '0.875rem', fontWeight: 600,
                          color: '#E43F6F',
                          py: 1.4, px: 2.5,
                          transition: 'background 0.15s ease',
                          '&:hover': { background: 'rgba(228,63,111,0.08)' },
                        }}
                      >
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <OpenModalMenuItem
                      itemText="Log In"
                      modalComponent={<LoginFormModal />}
                      buttonProps={{
                        variant: 'text',
                        size: 'small',
                        sx: {
                          fontFamily: `"DM Sans", sans-serif`,
                          fontWeight: 600, fontSize: '0.8rem',
                          px: 1.8, height: 34,
                          textTransform: 'none',
                          color: 'rgba(255,234,236,0.5)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.09)',
                          background: 'rgba(255,255,255,0.04)',
                          boxShadow: [
                            '3px 3px 10px rgba(0,0,0,0.3)',
                            '-1px -1px 4px rgba(255,255,255,0.02)',
                            '0 1px 0 rgba(255,255,255,0.06) inset',
                          ].join(', '),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: '#FFEAEC',
                            borderColor: 'rgba(255,255,255,0.18)',
                            background: 'rgba(255,255,255,0.07)',
                          },
                        },
                      }}
                    />

                    <OpenModalMenuItem
                      itemText="Sign Up"
                      modalComponent={<SignUpFormModal />}
                      buttonProps={{
                        variant: 'contained',
                        size: 'small',
                        sx: {
                          fontFamily: `"DM Sans", sans-serif`,
                          fontWeight: 700, fontSize: '0.8rem',
                          px: 1.8, height: 34,
                          textTransform: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #E43F6F, #c02d5a)',
                          border: '1px solid rgba(228,63,111,0.4)',
                          boxShadow: [
                            '0 4px 14px rgba(228,63,111,0.35)',
                            '3px 3px 10px rgba(0,0,0,0.3)',
                            '0 1px 0 rgba(255,255,255,0.15) inset',
                          ].join(', '),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f0537f, #d03568)',
                            boxShadow: [
                              '0 6px 20px rgba(228,63,111,0.5)',
                              '4px 4px 14px rgba(0,0,0,0.35)',
                            ].join(', '),
                            transform: 'translateY(-1px)',
                          },
                        },
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Mobile hamburger */}
            <IconButton
              edge="end"
              onClick={handleMenuOpen}
              size="small"
              sx={{ ...iconBtnSx, display: { xs: 'flex', md: 'none' } }}
              aria-label="menu"
            >
              <MenuIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Mobile dropdown ── */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 210,
            background: 'rgba(16,11,14,0.97)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '1px solid rgba(255,255,255,0.13)',
            borderRadius: '16px',
            boxShadow: [
              '0 24px 60px rgba(0,0,0,0.75)',
              '6px 6px 20px rgba(0,0,0,0.4)',
              '-2px -2px 8px rgba(255,255,255,0.01)',
              '0 1px 0 rgba(255,255,255,0.06) inset',
            ].join(', '),
            overflow: 'hidden',
            '& .MuiList-root': { py: 1.5 },
          },
        }}
      >
        {NAV_LINKS.map(({ path, label }) => (
          <MenuItem
            key={path}
            onClick={() => handleNav(path)}
            sx={{
              fontFamily: `"DM Sans", sans-serif`,
              fontSize: '0.875rem', fontWeight: 500,
              color: 'rgba(255,234,236,0.48)',
              py: 1.2, px: 2.5,
              transition: 'all 0.15s ease',
              '&:hover': { color: '#FFEAEC', background: 'rgba(255,255,255,0.05)' },
            }}
          >
            {label}
          </MenuItem>
        ))}

        <Box sx={{ height: '1px', background: 'rgba(255,255,255,0.06)', mx: 2, my: 0.75 }} />

        <MenuItem
          onClick={() => handleNav('/cart')}
          sx={{
            fontFamily: `"DM Sans", sans-serif`,
            fontSize: '0.875rem', fontWeight: 500,
            color: 'rgba(255,234,236,0.48)',
            py: 1.2, px: 2.5,
            display: 'flex', justifyContent: 'space-between',
            '&:hover': { color: '#FFEAEC', background: 'rgba(255,255,255,0.05)' },
          }}
        >
          Cart
          {cartCount > 0 && (
            <Box sx={{
              px: 1, py: 0.15,
              background: 'rgba(228,63,111,0.15)',
              border: '1px solid rgba(228,63,111,0.3)',
              borderRadius: '100px',
            }}>
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                fontSize: '0.68rem', fontWeight: 700, color: '#E43F6F',
              }}>
                {cartCount}
              </Typography>
            </Box>
          )}
        </MenuItem>

        {isLoaded && (
          <>
            <Box sx={{ height: '1px', background: 'rgba(255,255,255,0.06)', mx: 2, my: 0.75 }} />

            {sessionUser ? (
              <>
                {/* Mobile user info */}
                <Box sx={{
                  px: 2.5, py: 1.5,
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  mb: 0.5,
                }}>
                  <Avatar sx={{
                    width: 28, height: 28, fontSize: '0.7rem',
                    bgcolor: '#E43F6F', fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(228,63,111,0.35)',
                  }}>
                    {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      fontFamily: `"Syne", sans-serif`,
                      fontWeight: 700, fontSize: '0.82rem',
                      color: '#FFEAEC', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sessionUser.username}
                    </Typography>
                    <Typography sx={{
                      fontFamily: `"DM Sans", sans-serif`,
                      fontSize: '0.68rem',
                      color: 'rgba(255,234,236,0.32)',
                      lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sessionUser.email}
                    </Typography>
                  </Box>
                </Box>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{
                    fontFamily: `"DM Sans", sans-serif`,
                    fontSize: '0.875rem', fontWeight: 600,
                    color: '#E43F6F', py: 1.2, px: 2.5,
                    '&:hover': { background: 'rgba(228,63,111,0.08)' },
                  }}
                >
                  Logout
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem sx={{
                  py: 1.2, px: 2.5,
                  display: 'flex', justifyContent: 'center',
                  '&:hover': { background: 'rgba(255,255,255,0.05)' },
                }}>
                  <OpenModalMenuItem
                    itemText="Log In"
                    modalComponent={<LoginFormModal />}
                    onItemClick={handleMenuClose}
                    buttonProps={{
                      sx: {
                        fontFamily: `"DM Sans", sans-serif`,
                        fontSize: '0.875rem', fontWeight: 500,
                        color: 'rgba(255,234,236,0.48)',
                        textAlign: 'center',
                      },
                    }}
                  />
                </MenuItem>

                <MenuItem sx={{
                  py: 1.2, px: 2.5,
                  display: 'flex', justifyContent: 'center',
                  '&:hover': { background: 'rgba(228,63,111,0.08)' },
                }}>
                  <OpenModalMenuItem
                    itemText="Sign Up"
                    modalComponent={<SignUpFormModal />}
                    onItemClick={handleMenuClose}
                    buttonProps={{
                      sx: {
                        fontFamily: `"DM Sans", sans-serif`,
                        fontSize: '0.875rem', fontWeight: 700,
                        color: '#E43F6F', textAlign: 'center',
                      },
                    }}
                  />
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>
    </>
  );
}

export default Navigation;
