import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import { Label } from 'generated-sources';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import TruncatedLabelMenu from './TruncatedLabelMenu/TruncatedLabelMenu';

interface TruncatedLabelProps {
  labelList?: Label[];
  onSizeChange: () => void;
}

const TruncatedLabel: React.FC<TruncatedLabelProps> = ({
  labelList,
  onSizeChange,
}) => (
  <div>
    <TruncateMarkup
      lines={1}
      onTruncate={() => onSizeChange()}
      ellipsis={<TruncatedLabelMenu labelList={labelList} />}
    >
      <div>
        {labelList?.map(label => (
          <TruncateMarkup.Atom key={label.id}>
            <LabelItem labelName={label.name} />
          </TruncateMarkup.Atom>
        ))}
      </div>
    </TruncateMarkup>
  </div>
);
export default TruncatedLabel;
