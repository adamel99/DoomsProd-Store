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

const ADMIN_LINK = { path: '/admin/orders', label: 'Admin' };

const iconBtnSx = (theme) => ({
  width: 34, height: 34,
  border: theme.custom.clay.border,
  borderRadius: '10px',
  color: theme.palette.text.secondary,
  background: theme.palette.background.paper,
  boxShadow: theme.custom.clay.raisedSmall,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    borderColor: `${theme.palette.primary.main}66`,
    background: theme.custom.clay.surfaceSoft,
    boxShadow: theme.custom.clay.floating,
  },
});

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const sessionUser = useSelector((state) => state.session.user);
  const isAdmin = sessionUser?.role === 'admin';
  const cartItems = useSelector((state) => state.cartItems.allItems || {});
  const cartCount = useMemo(() => Object.keys(cartItems).length, [cartItems]);
  const navLinks = useMemo(() => (
    isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS
  ), [isAdmin]);

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
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          background: scrolled
            ? theme.palette.background.paper
            : `${theme.palette.background.paper}cc`,
          backdropFilter: 'blur(28px) saturate(150%)',
          WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          borderBottom: theme.custom.clay.border,
          boxShadow: scrolled
            ? theme.custom.clay.floating
            : `0 1px 0 ${theme.custom.colors.cream}73 inset`,
          transition: 'all 0.4s ease',
        })}
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
          background: (theme) => `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
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
              bgcolor: 'primary.main', flexShrink: 0,
              boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}, 0 0 18px ${theme.palette.primary.main}80`,
            }} />
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: 'text.primary',
              letterSpacing: 0,
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
                    sx={(theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      background: theme.custom.clay.surfaceSoft,
                      border: theme.custom.clay.border,
                      borderRadius: '100px',
                      pl: 2, pr: 0.75,
                      height: 38,
                      width: '100%',
                      boxShadow: theme.custom.clay.pressed,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      '&:focus-within': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `${theme.custom.clay.pressed}, 0 0 0 3px ${theme.palette.primary.main}33`,
                      },
                    })}
                  >
                    <SearchIcon sx={{ fontSize: 15, color: 'text.secondary', mr: 1.2, flexShrink: 0 }} />
                    <InputBase
                      placeholder="Search beats, kits, loops…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      sx={{
                        flex: 1,
                        fontFamily: (theme) => theme.custom.fonts.body,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        '& input::placeholder': { color: 'text.disabled' },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleCloseSearch}
                      sx={{
                        width: 28, height: 28,
                        borderRadius: '100px',
                        color: 'text.secondary',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          color: 'primary.main',
                          background: (theme) => `${theme.custom.colors.cream}80`,
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
                  {navLinks.map(({ path, label }) => (
                    <Button
                      key={path}
                      component={NavLink}
                      to={path}
                      variant="text"
                      sx={{
                        fontFamily: (theme) => theme.custom.fonts.body,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        textTransform: 'none',
                        px: 2, py: 0.85,
                        minWidth: 'auto',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'text.primary',
                          background: (theme) => `${theme.custom.colors.cream}80`,
                          borderColor: (theme) => theme.palette.divider,
                        },
                        '&.active': {
                          color: 'primary.main',
                          fontWeight: 700,
                          background: (theme) => `${theme.palette.primary.main}18`,
                          borderColor: (theme) => `${theme.palette.primary.main}55`,
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
              sx={(theme) => ({
                ...iconBtnSx(theme),
                ...(showSearch && {
                  color: theme.palette.primary.main,
                  borderColor: `${theme.palette.primary.main}66`,
                  background: `${theme.palette.primary.main}18`,
                }),
              })}
              aria-label="search"
            >
              <SearchIcon sx={{ fontSize: 17 }} />
            </IconButton>

            {/* Cart */}
            <IconButton
              component={NavLink}
              to="/cart"
              size="small"
              sx={(theme) => ({
                ...iconBtnSx(theme),
                '&.active': {
                  color: theme.palette.primary.main,
                  borderColor: `${theme.palette.primary.main}66`,
                  background: `${theme.palette.primary.main}18`,
                },
              })}
              aria-label="cart"
            >
              <Badge
                badgeContent={cartCount}
                invisible={cartCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.58rem', height: 14, minWidth: 14,
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    fontFamily: (theme) => theme.custom.fonts.body, fontWeight: 700,
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 17 }} />
              </Badge>
            </IconButton>

            {/* ── Auth — Desktop ── */}
            {isLoaded && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '6px' }}>

                <Box sx={{ width: 1, height: 20, background: (theme) => theme.palette.divider, mx: '2px' }} />

                {sessionUser ? (
                  <>
                    {/* Clickable username pill → opens profile dropdown */}
                    <Box
                      onClick={handleProfileOpen}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.9,
                        px: 1.4, height: 34,
                        background: (theme) => profileOpen
                          ? `${theme.palette.primary.main}18`
                          : theme.palette.background.paper,
                        border: '1px solid',
                        borderColor: (theme) => profileOpen
                          ? `${theme.palette.primary.main}66`
                          : theme.custom.colors.cream,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        boxShadow: (theme) => theme.custom.clay.raisedSmall,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: (theme) => `${theme.palette.primary.main}66`,
                          background: (theme) => `${theme.palette.primary.main}14`,
                        },
                      }}
                    >
                      <Avatar sx={{
                        width: 20, height: 20, fontSize: '0.58rem',
                        bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700,
                        fontFamily: (theme) => theme.custom.fonts.display,
                      }}>
                        {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.body,
                        fontSize: '0.8rem', fontWeight: 600,
                        color: 'text.secondary',
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
                          background: (theme) => theme.custom.clay.surfaceSoft,
                          border: (theme) => theme.custom.clay.border,
                          borderRadius: '16px',
                          boxShadow: (theme) => theme.custom.clay.floating,
                          overflow: 'hidden',
                          '& .MuiList-root': { py: 0 },
                        },
                      }}
                    >
                      {/* User info header */}
                      <Box sx={{
                        px: 2.5, py: 2,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                      }}>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: '0.85rem',
                          bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700,
                          fontFamily: (theme) => theme.custom.fonts.display,
                          boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}66`,
                        }}>
                          {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{
                            fontFamily: (theme) => theme.custom.fonts.display,
                            fontWeight: 700, fontSize: '0.9rem',
                            color: 'text.primary', lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {sessionUser.username}
                          </Typography>
                          <Typography sx={{
                            fontFamily: (theme) => theme.custom.fonts.body,
                            fontSize: '0.72rem',
                            color: 'text.secondary',
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
                          history.push('/account');
                        }}
                        sx={{
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontSize: '0.875rem', fontWeight: 600,
                          color: 'text.secondary',
                          py: 1.4, px: 2.5,
                          transition: 'background 0.15s ease',
                          '&:hover': { color: 'text.primary', background: (theme) => `${theme.custom.colors.cream}80` },
                        }}
                      >
                        Account
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          handleProfileClose();
                          handleLogout();
                        }}
                        sx={{
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontSize: '0.875rem', fontWeight: 600,
                          color: 'primary.main',
                          py: 1.4, px: 2.5,
                          transition: 'background 0.15s ease',
                          '&:hover': { background: (theme) => `${theme.palette.primary.main}14` },
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
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontWeight: 600, fontSize: '0.8rem',
                          px: 1.8, height: 34,
                          textTransform: 'none',
                          color: 'text.secondary',
                          borderRadius: '10px',
                          border: (theme) => theme.custom.clay.border,
                          background: (theme) => theme.palette.background.paper,
                          boxShadow: (theme) => theme.custom.clay.raisedSmall,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: 'text.primary',
                            borderColor: (theme) => `${theme.palette.primary.main}66`,
                            background: (theme) => theme.custom.clay.surfaceSoft,
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
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontWeight: 700, fontSize: '0.8rem',
                          px: 1.8, height: 34,
                          textTransform: 'none',
                          borderRadius: '10px',
                          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          border: (theme) => `1px solid ${theme.palette.primary.main}66`,
                          boxShadow: (theme) => theme.custom.clay.raisedSmall,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            boxShadow: (theme) => theme.custom.clay.floating,
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
              sx={(theme) => ({ ...iconBtnSx(theme), display: { xs: 'flex', md: 'none' } })}
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
            background: (theme) => theme.custom.clay.surfaceSoft,
            border: (theme) => theme.custom.clay.border,
            borderRadius: '16px',
            boxShadow: (theme) => theme.custom.clay.floating,
            overflow: 'hidden',
            '& .MuiList-root': { py: 1.5 },
          },
        }}
      >
        {navLinks.map(({ path, label }) => (
          <MenuItem
            key={path}
            onClick={() => handleNav(path)}
            sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: '0.875rem', fontWeight: 500,
              color: 'text.secondary',
              py: 1.2, px: 2.5,
              transition: 'all 0.15s ease',
              '&:hover': { color: 'text.primary', background: (theme) => `${theme.custom.colors.cream}80` },
            }}
          >
            {label}
          </MenuItem>
        ))}

        <Box sx={{ height: '1px', background: (theme) => theme.palette.divider, mx: 2, my: 0.75 }} />

        <MenuItem
          onClick={() => handleNav('/cart')}
          sx={{
            fontFamily: (theme) => theme.custom.fonts.body,
            fontSize: '0.875rem', fontWeight: 500,
            color: 'text.secondary',
            py: 1.2, px: 2.5,
            display: 'flex', justifyContent: 'space-between',
            '&:hover': { color: 'text.primary', background: (theme) => `${theme.custom.colors.cream}80` },
          }}
        >
          Cart
          {cartCount > 0 && (
            <Box sx={{
              px: 1, py: 0.15,
              background: (theme) => `${theme.palette.primary.main}22`,
              border: (theme) => `1px solid ${theme.palette.primary.main}66`,
              borderRadius: '100px',
            }}>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.body,
                fontSize: '0.68rem', fontWeight: 700, color: 'primary.main',
              }}>
                {cartCount}
              </Typography>
            </Box>
          )}
        </MenuItem>

        {isLoaded && (
          <>
            <Box sx={{ height: '1px', background: (theme) => theme.palette.divider, mx: 2, my: 0.75 }} />

            {sessionUser ? (
              <>
                {/* Mobile user info */}
                <Box sx={{
                  px: 2.5, py: 1.5,
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  mb: 0.5,
                }}>
                  <Avatar sx={{
                    width: 28, height: 28, fontSize: '0.7rem',
                    bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700,
                    boxShadow: (theme) => `0 3px 10px ${theme.palette.primary.main}55`,
                  }}>
                    {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 700, fontSize: '0.82rem',
                      color: 'text.primary', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sessionUser.username}
                    </Typography>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.body,
                      fontSize: '0.68rem',
                      color: 'text.secondary',
                      lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sessionUser.email}
                    </Typography>
                  </Box>
                </Box>

                <MenuItem
                  onClick={() => handleNav('/account')}
                  sx={{
                    fontFamily: (theme) => theme.custom.fonts.body,
                    fontSize: '0.875rem', fontWeight: 600,
                    color: 'text.secondary',
                    py: 1.2, px: 2.5,
                    '&:hover': { color: 'text.primary', background: (theme) => `${theme.custom.colors.cream}80` },
                  }}
                >
                  Account
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{
                    fontFamily: (theme) => theme.custom.fonts.body,
                    fontSize: '0.875rem', fontWeight: 600,
                    color: 'primary.main', py: 1.2, px: 2.5,
                    '&:hover': { background: (theme) => `${theme.palette.primary.main}14` },
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
                  '&:hover': { background: (theme) => `${theme.custom.colors.cream}80` },
                }}>
                  <OpenModalMenuItem
                    itemText="Log In"
                    modalComponent={<LoginFormModal />}
                    onItemClick={handleMenuClose}
                    buttonProps={{
                      sx: {
                        fontFamily: (theme) => theme.custom.fonts.body,
                        fontSize: '0.875rem', fontWeight: 500,
                        color: 'text.secondary',
                        textAlign: 'center',
                      },
                    }}
                  />
                </MenuItem>

                <MenuItem sx={{
                  py: 1.2, px: 2.5,
                  display: 'flex', justifyContent: 'center',
                  '&:hover': { background: (theme) => `${theme.palette.primary.main}14` },
                }}>
                  <OpenModalMenuItem
                    itemText="Sign Up"
                    modalComponent={<SignUpFormModal />}
                    onItemClick={handleMenuClose}
                    buttonProps={{
                      sx: {
                        fontFamily: (theme) => theme.custom.fonts.body,
                        fontSize: '0.875rem', fontWeight: 700,
                        color: 'primary.main', textAlign: 'center',
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
