import React from 'react';
import { Group } from '@visx/group';
import type { DataEntityLineageNode, DataSource } from 'generated-sources';
import { TruncatedSVGText } from 'components/shared/elements';
import type { StreamType } from 'redux/interfaces';
import type { NodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import {
  INFO_MIN_ODDRN_HEIGHT,
  NODE_MIN_TITLE_HEIGHT,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';
import GroupedEntitiesListModal from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/Info/GroupedEntitiesListModal/GroupedEntitiesListModal';
import ItemsButton from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/Info/ItemsButton/ItemsButton';
import * as S from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/Info/InfoStyles';

interface InfoProps {
  id: number;
  rootNodeId: number;
  dataSource: DataSource | undefined;
  nodesRelatedWithDEG: DataEntityLineageNode[] | undefined;
  internalName: string | undefined;
  externalName: string | undefined;
  streamType: StreamType;
  oddrn: string;
  nodeSize: NodeSize;
  full: boolean;
  fullNames: boolean;
}

const Info = React.memo<InfoProps>(
  ({
    id,
    dataSource,
    nodesRelatedWithDEG,
    streamType,
    rootNodeId,
    internalName,
    externalName,
    oddrn,
    nodeSize,
    fullNames,
    full,
  }) => {
    if (!full && !externalName) {
      return (
        <Group top={nodeSize.content.info.y} left={nodeSize.content.info.x}>
          <S.Attribute>
            <S.Placeholder x={0} y={0}>
              No Information
            </S.Placeholder>
          </S.Attribute>
        </Group>
      );
    }

    const verticalODDRNOffset = fullNames
      ? -nodeSize.content.title.height / 2
      : -NODE_MIN_TITLE_HEIGHT / 2;

    const verticalInfoOffset =
      nodeSize.content.info.oddrnHeight > INFO_MIN_ODDRN_HEIGHT ? 10 : 0;

    if (full && externalName) {
      return (
        <Group
          top={nodeSize.content.info.y + verticalInfoOffset}
          left={nodeSize.content.info.x}
        >
          <S.Attribute>
            <S.AttributeLabel
              key={`nsl-${id}`}
              x={0}
              y={0}
              width={nodeSize.content.info.labelWidth}
            >
              Space
            </S.AttributeLabel>
            {dataSource?.namespace ? (
              <TruncatedSVGText
                x={nodeSize.content.info.labelWidth}
                tagName='tspan'
                text={dataSource?.namespace?.name}
                title={dataSource?.namespace?.name}
                width={nodeSize.content.info.contentWidth}
              />
            ) : (
              <S.Placeholder x={nodeSize.content.info.labelWidth} y={0}>
                No Information
              </S.Placeholder>
            )}
          </S.Attribute>
          <S.Attribute>
            <S.AttributeLabel
              key={`dsl-${id}`}
              x={0}
              y={nodeSize.content.info.lineHeight}
              width={nodeSize.content.info.labelWidth}
            >
              Source
            </S.AttributeLabel>
            {dataSource ? (
              <TruncatedSVGText
                x={nodeSize.content.info.labelWidth}
                tagName='tspan'
                text={dataSource?.name}
                title={dataSource?.name}
                width={nodeSize.content.info.contentWidth}
              />
            ) : (
              <S.Placeholder
                x={nodeSize.content.info.labelWidth}
                y={nodeSize.content.info.lineHeight}
              >
                No Information
              </S.Placeholder>
            )}
          </S.Attribute>
          {nodesRelatedWithDEG && nodesRelatedWithDEG?.length > 0 && (
            <>
              <S.Attribute>
                <S.AttributeLabel
                  key={`items-${id}`}
                  x={0}
                  y={nodeSize.content.info.lineHeight * 2}
                >
                  Items
                </S.AttributeLabel>
              </S.Attribute>
              <GroupedEntitiesListModal
                entities={nodesRelatedWithDEG}
                dataEntityName={internalName || externalName}
                streamType={streamType}
                rootNodeId={rootNodeId}
                openBtnEl={
                  <ItemsButton text={`${nodesRelatedWithDEG.length} entities`} />
                }
              />
            </>
          )}
        </Group>
      );
    }

    return full ? (
      <Group
        top={nodeSize.content.info.y + verticalODDRNOffset}
        left={nodeSize.content.info.x}
      >
        <S.ODDRNLabel
          key={`ODDRN-${id}`}
          x={0}
          y={0}
          width={nodeSize.content.info.labelWidth}
        >
          ODDRN
        </S.ODDRNLabel>
        <foreignObject
          width={nodeSize.content.info.labelWidth + nodeSize.content.info.contentWidth}
          height={nodeSize.content.info.oddrnHeight}
        >
          <S.ODDRNWrapper>{oddrn}</S.ODDRNWrapper>
        </foreignObject>
      </Group>
    ) : null;
  }
);

export default Info;
