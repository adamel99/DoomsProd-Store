import React from 'react';
import { useModal } from '../../context/Modal';
import { Typography } from '@mui/material';

function OpenModalMenuItem({ modalComponent, itemText, onItemClick, onModalClose, buttonProps }) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);
    if (onItemClick) onItemClick();
  };

  return (
    <Typography
      onClick={onClick}
      sx={{
        fontFamily: `"DM Sans", sans-serif`,
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'rgba(255,234,236,0.55)',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
        display: 'inline-flex',        // ← was 'block'
        alignItems: 'center',          // ← add
        justifyContent: 'center',      // ← add
        whiteSpace: 'nowrap',          // ← add
        transition: 'color 0.15s ease',
        '&:hover': { color: '#FFEAEC' },
        ...buttonProps?.sx,
      }}
    >
      {itemText}
    </Typography>
  );
}

export default OpenModalMenuItem;
