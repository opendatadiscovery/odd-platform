import React from 'react';
import TruncateMarkup from 'react-truncate-markup';
import { Label } from 'generated-sources';
import LabelItem from 'components/shared/LabelItem/LabelItem';

import * as S from './TruncatedLabelStyles';
import TruncatedLabelMenu from './TruncatedLabelMenu/TruncatedLabelMenu';

interface TruncatedLabelProps {
  dataList?: Label[];
  externalEntityId: number;
}
const TruncatedLabel: React.FC<TruncatedLabelProps> = ({
  dataList,
  externalEntityId,
}) => (
  <TruncateMarkup
    lines={1}
    ellipsis={
      <TruncatedLabelMenu dataList={dataList} menuId={externalEntityId} />
    }
  >
    <S.TruncatedList>
      {dataList?.map(label => (
        <TruncateMarkup.Atom key={label.id}>
          <S.LinkContent>
            <LabelItem labelName={label.name} />
          </S.LinkContent>
        </TruncateMarkup.Atom>
      ))}
    </S.TruncatedList>
  </TruncateMarkup>
);
export default TruncatedLabel;
