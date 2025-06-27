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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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

  return (
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
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },
          py: 1.5,         // Adds vertical padding for breathing space
          minHeight: 80,    // Taller toolbar for better visual balance
          flexWrap: 'wrap',
          gap: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // subtle shadow under nav
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            fontSize: '1.25rem',
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={NavLink}
            to="/products"
            variant="text"
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Products
          </Button>

          <Button
            component={NavLink}
            to="/about"
            variant="text"
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            About
          </Button>

          <NavLink
            to="/cart"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <IconButton color="primary" aria-label="Go to cart">
              <Badge badgeContent={cartCount} color="secondary" invisible={cartCount === 0}>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </NavLink>

          {/* Search form */}
          <Box
            component="form"
            onSubmit={onSearchSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 99,
              backgroundColor: alpha('#fff', 0.07),
              border: '1px solid',
              borderColor: alpha('#fff', 0.15),
              px: 2,
              py: 0.5,
              width: { xs: 160, sm: 240, md: 320 },
              boxShadow: `0 0 6px ${alpha('#ff4081', 0.3)}`,
              transition: 'box-shadow 0.3s ease',
              '&:focus-within': {
                boxShadow: `0 0 12px ${alpha('#ff4081', 0.7)}`,
                borderColor: '#ff4081',
                backgroundColor: alpha('#fff', 0.15),
              },
              mt: 1, // Add vertical space so search bar doesn’t touch top
            }}
          >
            <InputBase
              placeholder="Search…"
              sx={{ ml: 1, color: 'inherit', flexGrow: 1, fontSize: '0.9rem' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              inputProps={{ 'aria-label': 'search beats' }}
            />
            <IconButton
              type="submit"
              sx={{ p: 0.5 }}
              color="primary"
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </Box>

          {isLoaded && sessionUser ? (
            <>
              <ProfileButton user={sessionUser} />
              <Button
                color="secondary"
                variant="outlined"
                onClick={handleLogout}
                sx={{ fontWeight: 600 }}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
