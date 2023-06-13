import React from 'react';
import { DataEntityClassLabelMap } from 'lib/constants';
import type { DataEntityClass } from 'generated-sources';
import { Group } from '@visx/group';
import * as S from './ClassesStyles';
import type { NodeSize } from '../../../../lineageLib/interfaces';

interface ClassesProps {
  entityClasses: DataEntityClass[] | undefined;
  nodeSize: NodeSize;
}

const Classes = React.memo<ClassesProps>(({ entityClasses, nodeSize }) => (
  <>
    {entityClasses?.map((entityClass, i) => (
      <Group
        key={entityClass.id}
        top={nodeSize.content.classes.y}
        left={
          nodeSize.content.classes.x +
          i * (nodeSize.content.classes.width + nodeSize.content.classes.mx)
        }
      >
        <S.EntityClassContainer
          $entityClassName={entityClass.name}
          width={nodeSize.content.classes.width}
          height={nodeSize.content.classes.height}
        />
        <S.TypeLabel
          x={nodeSize.content.classes.width / 2}
          y={nodeSize.content.classes.height / 2 + 1}
        >
          <tspan alignmentBaseline='middle'>
            {DataEntityClassLabelMap.get(entityClass.name)?.short}
            <title>{DataEntityClassLabelMap.get(entityClass.name)?.normal}</title>
          </tspan>
        </S.TypeLabel>
      </Group>
    ))}
  </>
));

export default Classes;
