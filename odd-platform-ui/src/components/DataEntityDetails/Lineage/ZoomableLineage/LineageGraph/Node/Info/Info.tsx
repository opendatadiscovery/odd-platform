import React from 'react';
import { Group } from '@visx/group';
import type { DataEntityLineageNode, DataSource } from 'generated-sources';
import { TruncatedSVGText } from 'components/shared';
import type { StreamType } from 'redux/interfaces';
import GroupedEntitiesListModal from './GroupedEntitiesListModal/GroupedEntitiesListModal';
import ItemsButton from './ItemsButton/ItemsButton';
import LineageContext from '../../../../lineageLib/LineageContext/LineageContext';
import * as S from './InfoStyles';

interface InfoProps {
  id: number;
  rootNodeId: number;
  dataSource: DataSource | undefined;
  nodesRelatedWithDEG: DataEntityLineageNode[] | undefined;
  internalName: string | undefined;
  externalName: string | undefined;
  streamType: StreamType;
}

const Info: React.FC<InfoProps> = ({
  id,
  dataSource,
  nodesRelatedWithDEG,
  streamType,
  rootNodeId,
  internalName,
  externalName,
}) => {
  const { nodeSize, compact } = React.useContext(LineageContext);

  if (compact && !externalName) {
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

  return !compact ? (
    <Group top={nodeSize.content.info.y} left={nodeSize.content.info.x}>
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
              <ItemsButton
                text={`${nodesRelatedWithDEG && nodesRelatedWithDEG.length} entities`}
              />
            }
          />
        </>
      )}
    </Group>
  ) : null;
};

export default Info;
