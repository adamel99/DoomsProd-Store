import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileButton from './ProfileButton';

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

  const [anchorEl, setAnchorEl] = useState(null); // For hamburger dropdown
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
          background: 'rgba(20, 19, 19, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
    minHeight: 80,
  }}
>
  {/* Left: Logo */}
  <Typography
    variant="h6"
    sx={{
      fontWeight: 900,
      fontSize: '1.4rem',
      color: 'primary.main',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      cursor: 'pointer',
      userSelect: 'none',
    }}
    onClick={() => history.push('/')}
  >
    HOME
  </Typography>

  {/* Center: Navigation Links (desktop only) */}
  <Box
    sx={{
      display: { xs: 'none', md: 'flex' },
      gap: 2,
    }}
  >
    {['/products', '/about', '/licenses'].map((path, i) => (
      <Button
        key={i}
        component={NavLink}
        to={path}
        variant="text"
        color="inherit"
        sx={{
          fontWeight: 600,
          '&.active': {
            color: 'primary.main',
            borderBottom: '2px solid',
            borderRadius: 0,
          },
        }}
      >
        {path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
      </Button>
    ))}
  </Box>

  {/* Right: Search + Cart + User */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    {/* Search */}
    <Box
      component="form"
      onSubmit={onSearchSubmit}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        borderRadius: '999px',
        backgroundColor: alpha('#fff', 0.1),
        border: '1px solid',
        borderColor: alpha('#fff', 0.15),
        px: 1.5,
        py: 0.5,
        width: { sm: 160, md: 220 },
        '&:focus-within': {
          borderColor: 'primary.main',
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
      <IconButton type="submit" sx={{ p: 0.5 }} color="primary">
        <SearchIcon />
      </IconButton>
    </Box>

    {/* Cart */}
    <NavLink to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
      <IconButton color="primary">
        <Badge badgeContent={cartCount} color="secondary" invisible={cartCount === 0}>
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </NavLink>

    {/* User */}
    {isLoaded && sessionUser ? (
      <>
        <ProfileButton user={sessionUser} />
        <Button color="secondary" onClick={handleLogout} sx={{ fontWeight: 600 }}>
          Logout
        </Button>
      </>
    ) : (
      <>
        <OpenModalMenuItem itemText="Log In" modalComponent={<LoginFormModal />} />
        <OpenModalMenuItem itemText="Sign Up" modalComponent={<SignUpFormModal />} />
      </>
    )}

    {/* Hamburger (mobile only) */}
    <IconButton
      edge="end"
      color="inherit"
      onClick={handleMenuOpen}
      sx={{ display: { xs: 'flex', md: 'none' } }}
    >
      <MenuIcon />
    </IconButton>
  </Box>
</Toolbar>
      </AppBar>

      {/* Mobile Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ display: { xs: 'block', md: 'none' } }}
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
