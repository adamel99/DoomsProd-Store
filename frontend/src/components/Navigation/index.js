import React, { useState, useEffect } from 'react';
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
  alpha,
  Menu,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';

import { logout } from '../../store/session';
import ProfileButton from './ProfileButton';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignUpFormModal from '../SignUpFormModal';
import LoginFormModal from '../LoginFormModal';

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();

  const sessionUser = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) => state.cartItems.allItems || {});
  const cartCount = Object.keys(cartItems).length;

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (showSearch) {
      const timeout = setTimeout(() => {
        document.querySelector('input[placeholder="Search…"]')?.focus();
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [showSearch]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    history.push('/');
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNav = (path) => {
    history.push(path);
    handleMenuClose();
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          zIndex: theme.zIndex.drawer + 1,
          position: 'relative',
        }}
      >
        {/* Subtle static glow blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(50px)',
            willChange: 'transform, opacity',
            zIndex: 0,
            display: { xs: 'none', md: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: 240,
            height: 240,
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(50px)',
            willChange: 'transform, opacity',
            zIndex: 0,
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: 0.5,
            minHeight: 56,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Typography
              variant="h5"
              onClick={() => history.push('/')}
              sx={{
                fontWeight: 800,
                fontSize: '1.9rem',
                letterSpacing: 1.5,
                color: theme.palette.text.primary,
                cursor: 'pointer',
                '&:hover': { color: theme.palette.primary.light },
                transition: 'color 0.15s ease',
              }}
            >
              doomsprod
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 2,
              flexGrow: 2,
              justifyContent: 'center',

            }}
          >
            {[
              { path: '/products', label: 'Products' },
              { path: '/about', label: 'About' },
              { path: '/licenses', label: 'Licenses' },
            ].map(({ path, label }) => (
              <Button
                key={path}
                component={NavLink}
                to={path}
                variant="text"
                color="inherit"
                sx={{
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  color: theme.palette.text.primary,
                  position: 'relative',
                  textTransform: 'none',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&:hover::after': {
                    opacity: 1,
                  },
                  '&.active': {
                    color: theme.palette.primary.light,
                    '&::after': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
            {/* Search */}
            {showSearch ? (
              <Box
                component="form"
                onSubmit={onSearchSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 20,
                  backgroundColor: alpha(theme.palette.common.white, 0.12),
                  px: 1.5,
                  py: 0.4,
                  width: { xs: 150, sm: 200 },
                  transition: 'width 0.3s ease',
                }}
              >
                <InputBase
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    ml: 1,
                    flex: 1,
                    fontSize: '0.9rem',
                    color: theme.palette.text.primary,
                    pr: 1,
                  }}
                />
                <IconButton
                  onClick={() => setShowSearch(false)}
                  sx={{
                    p: 0.5,
                    color: theme.palette.primary.main,
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => setShowSearch(true)}
                sx={{
                  ml: 1,
                  color: theme.palette.primary.main,
                }}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Cart */}
            <NavLink to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
              <IconButton sx={{ color: theme.palette.primary.main }} aria-label="cart">
                <Badge badgeContent={cartCount} color="secondary" invisible={cartCount === 0}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </NavLink>

            {/* Auth */}
            {isLoaded && sessionUser ? (
              <>
                <ProfileButton user={sessionUser} />
                <Button
                  onClick={handleLogout}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 0.6,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: 20,
                    color: theme.palette.common.white,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <OpenModalMenuItem itemText="Log In" modalComponent={<LoginFormModal />} />
                <OpenModalMenuItem itemText="Sign Up" modalComponent={<SignUpFormModal />} />
              </>
            )}

            {/* Hamburger Menu */}
            <IconButton
              edge="end"
              onClick={handleMenuOpen}
              sx={{ display: { xs: 'flex', md: 'none' }, color: theme.palette.text.primary }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 1,
          },
        }}
      >
        <MenuItem onClick={() => handleNav('/products')}>Products</MenuItem>
        <MenuItem onClick={() => handleNav('/about')}>About</MenuItem>
        <MenuItem onClick={() => handleNav('/licenses')}>Licenses</MenuItem>
        <MenuItem onClick={() => handleNav('/cart')}>Cart</MenuItem>
        {isLoaded && sessionUser ? (
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        ) : (
          <>
            <MenuItem>
              <OpenModalMenuItem itemText="Log In" modalComponent={<LoginFormModal />} />
            </MenuItem>
            <MenuItem>
              <OpenModalMenuItem itemText="Sign Up" modalComponent={<SignUpFormModal />} />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

export default Navigation;
