import React from 'react';
import { Box, Typography } from '@mui/material';
import { InfoIcon } from 'components/shared/icons';
import AppPopover from 'components/shared/elements/AppPopover/AppPopover';
import Button from 'components/shared/elements/Button/Button';

export interface InformationHintLink {
  label: string;
  href: string;
}

interface InformationHintProps {
  // The body of the hint. Pass already-translated content (the component is i18n-agnostic so callers
  // own their copy via react-i18next).
  content: React.ReactNode;
  title?: string;
  links?: InformationHintLink[];
  // Accessible name for the (i) trigger — describe what concept it explains, e.g. "About the User filter".
  ariaLabel: string;
}

// A small inline "(i)" affordance that opens a popover with a short concept explanation (and optional
// links). Reusable across the platform for in-context help next to an ambiguous label or control —
// see adrs/drafts/platform-info-popover-affordance.md. Built on AppPopover (click-to-open + a11y).
const InformationHint: React.FC<InformationHintProps> = ({ content, title, links, ariaLabel }) => (
  <AppPopover
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    childrenSx={{ maxWidth: 300, p: 1 }}
    renderOpenBtn={({ onClick, ariaDescribedBy }) => (
      <Button
        buttonType='linkGray-m'
        icon={<InfoIcon />}
        onClick={onClick}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
      />
    )}
  >
    <Box>
      {title && (
        <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {title}
        </Typography>
      )}
      <Typography variant='body2' component='div'>
        {content}
      </Typography>
      {links && links.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {links.map(link => (
            <Typography
              key={link.href}
              variant='body2'
              component='a'
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  </AppPopover>
);

export default InformationHint;
