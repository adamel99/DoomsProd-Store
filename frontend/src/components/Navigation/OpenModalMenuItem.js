import React from 'react';
import { useModal } from '../../context/Modal';

function OpenModalMenuItem({
    modalComponent,
    itemText,
    onItemClick,
    onModalClose
}) {
    const { setModalContent, setOnModalClose } = useModal();

    const onClick = () => {
        if (onModalClose) setOnModalClose(onModalClose);
        setModalContent(modalComponent);
        if(onItemClick) onItemClick();
    }

    return (
        <p onClick={onClick}>{itemText}</p>
    )
}

export default OpenModalMenuItem;
