import React from 'react';
import { Group } from '@visx/group';
import type { NodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import * as S from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/NodeTitle/NodeTitleStyles';

interface NodeTitleProps {
  externalName: string | undefined;
  internalName: string | undefined;
  handleTitleClick: () => void;
  nodeSize: NodeSize;
  fullNames: boolean;
}

const NodeTitle = React.memo<NodeTitleProps>(
  ({ externalName, internalName, handleTitleClick, fullNames, nodeSize }) => (
    <Group top={nodeSize.content.title.y} left={nodeSize.content.title.x}>
      {externalName ? (
        <>
          <title>{internalName || externalName}</title>
          <S.Title
            onClick={handleTitleClick}
            width={nodeSize.content.title.width}
            height={nodeSize.content.title.height}
          >
            <S.TitleWrapper $fullNames={fullNames}>
              {internalName || externalName}
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
  )
);

export default NodeTitle;
