import React from 'react';
import { Button, Avatar, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function ProfileButton({ user }) {
  const theme = useTheme();

  if (!user) return null;

  // Get first letter of username for avatar
  const initial = 'Hello';

  return (
    <Button
      variant="text"
      sx={{
        fontWeight: 600,
        fontSize: '0.85rem',
        px: 1.5,
        py: 0.75,
        textTransform: 'none',
        borderRadius: 20,
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(207, 18, 89, 0.08)',
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 24,
          fontSize: '0.75rem',
          backgroundColor: theme.palette.primary.main,
          fontWeight: 700,
        }}
      >
        {initial}
      </Avatar>
      <Box
        component="span"
        sx={{
          display: { xs: 'none', sm: 'inline' },
          maxWidth: 120,
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
