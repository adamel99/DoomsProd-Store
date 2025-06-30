import React, { useState } from 'react';
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

  const sessionUser = useSelector(state => state.session.user);
  const cartItems = useSelector(state => state.cartItems.allItems || {});
  const cartCount = Object.keys(cartItems).length;

  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onSearchSubmit = e => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
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
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(18, 18, 18, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: theme => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: 1,
            minHeight: 64,
          }}
        >
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'white',
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.2s ease',
            }}
            onClick={() => history.push('/')}
          >
            DOOMSPROD
          </Typography>

          {/* Nav Links (Desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
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
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'white',
                  '&.active': {
                    color: 'primary.main',
                  },
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'transparent',
                  },
                  textTransform: 'none',
                  padding: '6px 12px',
                  borderRadius: 1,
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Search */}
            <Box
              component="form"
              onSubmit={onSearchSubmit}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                borderRadius: 20,
                backgroundColor: alpha('#fff', 0.1),
                px: 1.5,
                py: 0.5,
                width: { sm: 160, md: 220 },
                '&:focus-within': {
                  backgroundColor: alpha('#fff', 0.15),
                },
              }}
            >
              <InputBase
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ ml: 1, flex: 1, fontSize: '0.9rem', color: 'inherit' }}
              />
              <IconButton type="submit" sx={{ p: 0.5 }} color="primary" aria-label="search">
                <SearchIcon />
              </IconButton>
            </Box>

            {/* Cart */}
            <NavLink to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="primary" aria-label="cart">
                <Badge badgeContent={cartCount} color="secondary" invisible={cartCount === 0}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </NavLink>

            {/* Auth / User */}
            {isLoaded && sessionUser ? (
              <>
                <ProfileButton user={sessionUser} />
                <Button
                  color="secondary"
                  onClick={handleLogout}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
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

            {/* Hamburger for Mobile */}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ display: { xs: 'flex', md: 'none' } }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            backgroundColor: '#121212',
            color: 'white',
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
