import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import logo from "../../assets/logo_sigla.png";
import { GoogleButton } from "../GoogleLoginButton";

export function AppHeader() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
    setDrawerOpen(false);
  };

  const menuItems = [
    { label: "Respostas", path: "responses" },
    { label: "Meus Quizzes", path: "admin" },
    { label: "Relatórios", path: "reports" },
    { label: "Quizzes", path: "quizzes" },
  ];

  const NavButtons = () => (
    <Box display="flex" gap={1}>
      {menuItems.map((item) => (
        <Button
          key={item.path}
          onClick={() => handleNavigate(item.path)}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            color: "text.primary",
            borderRadius: 2,
            px: 2,
            "&:hover": {
              backgroundColor: "grey.100",
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>

          {/* LEFT */}
          <Box display="flex" alignItems="center" gap={2}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="Logo" style={{ height: 32 }} />
            </Box>

            {!isMobile && <NavButtons />}
          </Box>

          {/* RIGHT */}
          <GoogleButton />

        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 240,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Drawer>
    </>
  );
}