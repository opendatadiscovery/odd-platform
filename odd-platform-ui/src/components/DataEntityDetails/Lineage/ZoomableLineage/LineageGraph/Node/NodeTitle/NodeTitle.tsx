import React from 'react';
import { Group } from '@visx/group';
import { TruncatedSVGText } from 'components/shared';
import LineageContext from '../../../../lineageLib/LineageContext/LineageContext';
import * as S from './NodeTitleStyles';

interface NodeTitleProps {
  externalName: string | undefined;
  internalName: string | undefined;
  handleTitleClick: () => void;
}

const NodeTitle: React.FC<NodeTitleProps> = ({
  externalName,
  internalName,
  handleTitleClick,
}) => {
  const { nodeSize } = React.useContext(LineageContext);

  return (
    <Group top={nodeSize.content.title.y} left={nodeSize.content.title.x}>
      {externalName ? (
        <S.Title>
          <TruncatedSVGText
            tagName='tspan'
            text={internalName || externalName}
            title={internalName || externalName}
            width={nodeSize.size.contentWidth}
            onClick={handleTitleClick}
          />
        </S.Title>
      ) : (
        <>
          <S.UnknownEntityNameCircle />
          <S.UnknownEntityNameCrossedLine />
        </>
      )}
    </Group>
  );
};

export default NodeTitle;
