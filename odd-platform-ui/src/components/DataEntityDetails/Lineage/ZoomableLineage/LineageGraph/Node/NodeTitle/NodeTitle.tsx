import React from 'react';
import { Group } from '@visx/group';
import truncate from 'lodash/truncate';
import * as S from './NodeTitleStyles';
import LineageContext from '../../../../lineageLib/LineageContext/LineageContext';

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
  const { nodeSize, fullTitles } = React.useContext(LineageContext);

  return (
    <Group top={nodeSize.content.title.y} left={nodeSize.content.title.x}>
      {externalName ? (
        <>
          <title>{internalName || externalName}</title>
          <S.Title
            onClick={handleTitleClick}
            width={nodeSize.content.title.width}
            height={nodeSize.content.title.height}
          >
            <S.TitleWrapper>
              {fullTitles
                ? internalName || externalName
                : truncate(internalName || externalName, { length: 40 })}
            </S.TitleWrapper>
          </S.Title>
        </>
      ) : (
        <Group
          alignmentBaseline='middle'
          top={nodeSize.content.title.y + 5}
          left={nodeSize.content.title.x - 5}
        >
          <S.UnknownEntityNameCircle />
          <S.UnknownEntityNameCrossedLine />
        </Group>
      )}
    </Group>
  );
};

export default NodeTitle;
