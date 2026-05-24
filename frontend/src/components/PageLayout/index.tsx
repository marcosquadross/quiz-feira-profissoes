import { ReactNode } from "react";
import { Box } from "@mui/material";
import { AppHeader } from "../AppHeader";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <Box>
      <AppHeader />
        {children}
    </Box>
  );
}