import { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import logo from "../../assets/logo_sigla.png";
import "./style.css";

interface HeaderProps {
    leftContent?: ReactNode;
    rightContent?: ReactNode;
    className?: string;
}

export function Header({ leftContent, rightContent, className = "" }: HeaderProps) {
    return (
        <AppBar position="static" className={className} color="default" elevation={1}>
            <Toolbar>
                <img src={logo} alt="Logo" className="utfpr-logo" />
                <Box sx={{ mr: 1 }}>{leftContent}</Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box>{rightContent}</Box>
            </Toolbar>
        </AppBar>
    );
}
