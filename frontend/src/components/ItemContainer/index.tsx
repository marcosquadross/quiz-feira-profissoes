import { ReactNode } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

interface ItemContainerProps {
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function ItemContainer({
  subtitle,
  headerActions,
  children,
}: ItemContainerProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>

        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Ações */}
          {headerActions && (
            <Box display="flex" gap={1}>
              {headerActions}
            </Box>
          )}
        </Box>

        {/* Conteúdo */}
        <Box display="flex" flexDirection="column" gap={2}>
          {children}
        </Box>

      </CardContent>
    </Card>
  );
}