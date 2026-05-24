import { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";

type PageContainerProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
};

export function PageContainer({
  title,
  subtitle,
  children,
  maxWidth = "md",
}: PageContainerProps) {
  return (
    <Box sx={{ backgroundColor: "#F7F9FC", minHeight: "100vh", py: 4 }}>
      <Container maxWidth={maxWidth}>
        <Box mb={4} textAlign="center">
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {children}
      </Container>
    </Box>
  );
}