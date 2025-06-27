import React from 'react';
import { Button } from '@mui/material';

function ProfileButton({ user }) {
  return (
    <Button color="primary" variant="outlined" sx={{ fontWeight: 700 }}>
      {user ? `Hello, ${user.username}` : 'Profile'}
    </Button>
  );
}

export default ProfileButton;
