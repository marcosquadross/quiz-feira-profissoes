import React, { useState } from 'react';
import { IconButton, Popover, Tooltip, Typography } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export interface HelpPopoverProps {
    popOverText: string;
}

export function HelpPopover({
    popOverText,
}: HelpPopoverProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <div style={{ display: "flex", justifyContent: "flex-end" }} >
            <Tooltip title="Clique para obter mais informações" arrow>
                <IconButton onClick={handleClick} sx={{ padding: "0.25rem" }}>
                    <HelpIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <div style={{ padding: 16, width: "12.5rem" }}>
                    <Typography variant="body2">{popOverText}</Typography>
                </div>
            </Popover>
        </div>
    );
};
