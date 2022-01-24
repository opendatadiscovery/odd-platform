import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

export const CaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(0.5),
}));

export const Preview = styled(
  ReactMarkdown
)<ReactMarkdown.ReactMarkdownProps>(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  fontFamily: 'inherit',
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.secondary,
}));

export const FormActions = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));
