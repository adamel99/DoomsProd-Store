// ProfileButton.jsx
import React from 'react';
import { Button, Avatar, Box, Typography } from '@mui/material';

function ProfileButton({ user }) {
  if (!user) return null;

  return (
    <Button
      variant="text"
      sx={{
        fontFamily: `"DM Sans", sans-serif`,
        fontWeight: 600,
        fontSize: '0.8rem',
        px: 1.5, py: 0.6,
        textTransform: 'none',
        borderRadius: '100px',
        color: 'rgba(255,234,236,0.65)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '3px 3px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(228,63,111,0.08)',
          borderColor: 'rgba(228,63,111,0.3)',
          color: '#FFEAEC',
        },
      }}
    >
      <Avatar sx={{
        width: 22, height: 22,
        fontSize: '0.65rem',
        bgcolor: '#E43F6F',
        color: '#fff',
        fontWeight: 700,
        fontFamily: `"Syne", sans-serif`,
      }}>
        {user.username?.[0]?.toUpperCase() || 'U'}
      </Avatar>
      <Box
        component="span"
        sx={{
          display: { xs: 'none', sm: 'inline' },
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {user.username}
      </Box>
    </Button>
  );
}

export default ProfileButton;
