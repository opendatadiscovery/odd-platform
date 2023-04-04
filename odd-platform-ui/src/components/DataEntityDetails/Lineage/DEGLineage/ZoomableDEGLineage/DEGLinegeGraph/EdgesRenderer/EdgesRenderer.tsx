import React, { memo } from 'react';
import Edge from '../../../components/Edge/Edge';
import type { Edge as EdgeType } from '../../../lib/interfaces';
import * as S from './EdgesRenderer.styles';

interface EdgesRendererProps {
  edges: EdgeType[];
}

const EdgesRenderer: React.FC<EdgesRendererProps> = ({ edges }) => (
  <S.Container>
    <g>
      {edges.map(edge => (
        <Edge key={edge.id} isHighlighted={edge.isHighlighted} sections={edge.sections} />
      ))}
    </g>
  </S.Container>
);

export default memo(EdgesRenderer);
