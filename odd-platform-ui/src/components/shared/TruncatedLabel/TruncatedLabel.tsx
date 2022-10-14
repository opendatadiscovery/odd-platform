import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import { Label } from 'generated-sources';
import { LabelItem } from 'components/shared';
import { Grid } from '@mui/material';
import TruncatedLabelMenu from './TruncatedLabelMenu/TruncatedLabelMenu';

interface TruncatedLabelProps {
  labelList?: Label[];
  onSizeChange: () => void;
}

const TruncatedLabel: React.FC<TruncatedLabelProps> = ({ labelList, onSizeChange }) => (
  <div>
    <TruncateMarkup
      lines={1}
      onTruncate={() => onSizeChange()}
      ellipsis={<TruncatedLabelMenu labelList={labelList} />}
    >
      <Grid container alignItems='center'>
        {labelList?.map(label => (
          <TruncateMarkup.Atom key={label.id}>
            <LabelItem systemLabel={label.external} labelName={label.name} />
          </TruncateMarkup.Atom>
        ))}
      </Grid>
    </TruncateMarkup>
  </div>
);
export default TruncatedLabel;
