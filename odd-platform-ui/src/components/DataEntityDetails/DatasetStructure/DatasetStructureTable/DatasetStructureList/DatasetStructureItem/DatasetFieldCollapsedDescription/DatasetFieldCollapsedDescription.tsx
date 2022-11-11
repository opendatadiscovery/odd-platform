import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';

interface DatasetFieldCollapsedDescriptionProps {
  content: string;
  onSizeChange: () => void;
}

const DatasetFieldCollapsedDescription: React.FC<
  DatasetFieldCollapsedDescriptionProps
> = ({ content, onSizeChange }) => {
  const [viewDesc, setViewDesc] = React.useState(false);
  const truncatedTextRef = React.useRef<HTMLElement>(null);

  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    if (truncatedTextRef.current) {
      const element = truncatedTextRef.current;
      const { scrollWidth, clientWidth } = element;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, [content]);

  return (
    <>
      {!viewDesc && content && (
        <Grid container flexWrap='nowrap' sx={{ minWidth: '100%', maxWidth: '0px' }}>
          <Typography
            sx={{ flexBasis: '98%' }}
            variant='body1'
            color='texts.info'
            noWrap
            ref={truncatedTextRef}
          >
            {content}
          </Typography>
          {isTruncated && (
            <AppButton
              size='medium'
              color='tertiary'
              sx={{ flexBasis: 'auto' }}
              onClick={() => setViewDesc(true)}
            >
              More
            </AppButton>
          )}
        </Grid>
      )}
      <Collapse
        in={viewDesc}
        timeout={0}
        unmountOnExit
        addEndListener={() => onSizeChange()}
      >
        <Typography variant='subtitle1'>{content}</Typography>
        <AppButton
          size='medium'
          color='tertiary'
          sx={{ mr: 1 }}
          onClick={() => setViewDesc(false)}
        >
          Hide
        </AppButton>
      </Collapse>
    </>
  );
};

export default DatasetFieldCollapsedDescription;
