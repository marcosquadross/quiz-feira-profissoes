import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';

interface StyledButtonProps {
  buttonColor?: string;
}

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'buttonColor', 
})<StyledButtonProps>(({ buttonColor }) => ({
  fontWeight: 'bold',
  borderRadius: 8,
  fontSize: 16,
  backgroundColor: buttonColor || 'defaultColor',
}));

export function StyledButton(props: StyledButtonProps & ButtonProps) {
  const { buttonColor, ...rest } = props;
  return <CustomButton buttonColor={buttonColor} {...rest} />;
}
