import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
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
import { useTheme } from '@mui/material/styles';

import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';

import { logout } from '../../store/session';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignUpFormModal from '../SignUpFormModal';
import LoginFormModal from '../LoginFormModal';

const NAV_LINKS = [
  { path: '/products', label: 'Products' },
  { path: '/about', label: 'About' },
  { path: '/licenses', label: 'Licenses' },
];

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();

  const sessionUser = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) => state.cartItems.allItems || {});

  const cartCount = useMemo(() => Object.keys(cartItems).length, [cartItems]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (showSearch) {
      const timeout = setTimeout(() => {
        document.querySelector('input[placeholder="Search…"]')?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [showSearch]);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  }, [searchTerm, history]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    history.push('/');
  }, [dispatch, history]);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNav = useCallback((path) => {
    history.push(path);
    handleMenuClose();
  }, [history, handleMenuClose]);

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Logo */}
          <Box
            onClick={() => history.push('/')}
            sx={{
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                color: theme.palette.text.primary,
                userSelect: 'none',
              }}
            >
              doomsprod
            </Typography>
          </Box>

          {/* Desktop Nav Links */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            {NAV_LINKS.map(({ path, label }) => (
              <Button
                key={path}
                component={NavLink}
                to={path}
                variant="text"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  minWidth: 'auto',
                  '&:hover': {
                    color: theme.palette.text.primary,
                    backgroundColor: 'transparent',
                  },
                  '&.active': {
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Search */}
            {showSearch ? (
              <Box
                component="form"
                onSubmit={onSearchSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  px: 0,
                  py: 0,
                  width: { xs: 160, sm: 220 },
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <InputBase
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  sx={{
                    flex: 1,
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                  }}
                />
                <IconButton
                  type="submit"
                  size="small"
                  sx={{ p: 0.5, color: theme.palette.text.secondary }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => setShowSearch(true)}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.text.primary },
                }}
                aria-label="search"
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            )}

            {/* Cart */}
            <IconButton
              component={NavLink}
              to="/cart"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary },
              }}
              aria-label="cart"
            >
              <Badge
                badgeContent={cartCount}
                color="primary"
                invisible={cartCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <ShoppingCartIcon fontSize="small" />
              </Badge>
            </IconButton>

            {/* Auth Buttons - Desktop */}
            {isLoaded && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 1 }}>
                {sessionUser ? (
                  <>
                    <Button
                      variant="text"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        px: 1.5,
                        py: 0.5,
                        textTransform: 'none',
                        color: theme.palette.text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 'auto',
                        '&:hover': {
                          color: theme.palette.text.primary,
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          backgroundColor: theme.palette.grey[300],
                          color: theme.palette.grey[700],
                        }}
                      >
                        {sessionUser.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box
                        component="span"
                        sx={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sessionUser.username}
                      </Box>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="text"
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        px: 1.5,
                        py: 0.5,
                        textTransform: 'none',
                        color: theme.palette.text.secondary,
                        minWidth: 'auto',
                        '&:hover': {
                          color: theme.palette.text.primary,
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      Logout
                    </Button>
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
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          px: 1.5,
                          py: 0.5,
                          textTransform: 'none',
                          color: theme.palette.text.secondary,
                          minWidth: 'auto',
                          '&:hover': {
                            color: theme.palette.text.primary,
                            backgroundColor: 'transparent',
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
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          px: 2,
                          py: 0.5,
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 'none' },
                        },
                      }}
                    />
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Icon */}
            <IconButton
              edge="end"
              onClick={handleMenuOpen}
              size="small"
              sx={{
                display: { xs: 'flex', md: 'none' },
                ml: 0.5,
                color: theme.palette.text.secondary,
              }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            boxShadow: theme.shadows[2],
          },
        }}
      >
        {NAV_LINKS.map(({ path, label }) => (
          <MenuItem
            key={path}
            onClick={() => handleNav(path)}
            sx={{
              py: 1,
              px: 2,
              fontSize: '0.875rem',
            }}
          >
            {label}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => handleNav('/cart')}
          sx={{
            py: 1,
            px: 2,
            fontSize: '0.875rem',
          }}
        >
          Cart {cartCount > 0 && `(${cartCount})`}
        </MenuItem>

        {isLoaded && (
          <>
            {sessionUser ? (
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1,
                  px: 2,
                  fontSize: '0.875rem',
                }}
              >
                Logout
              </MenuItem>
            ) : (
              <>
                <MenuItem sx={{ py: 1, px: 2 }}>
                  <OpenModalMenuItem
                    itemText="Log In"
                    modalComponent={<LoginFormModal />}
                  />
                </MenuItem>
                <MenuItem sx={{ py: 1, px: 2 }}>
                  <OpenModalMenuItem
                    itemText="Sign Up"
                    modalComponent={<SignUpFormModal />}
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
