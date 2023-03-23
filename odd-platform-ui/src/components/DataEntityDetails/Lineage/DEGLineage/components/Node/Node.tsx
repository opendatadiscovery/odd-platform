import React, { forwardRef, memo, useCallback } from 'react';
import { Typography } from '@mui/material';
import { useAppPaths } from 'lib/hooks';
import { useNavigate } from 'react-router-dom';
import { DownstreamArrow, UpstreamArrow } from 'components/shared/Icons';
import { EntityClassItem, LabeledInfoItem } from 'components/shared';
import EmptyIcon from 'components/shared/Icons/EmptyIcon';
import * as S from './Node.styles';
import type { Node as NodeType } from '../../lib/interfaces';

interface NodeProps {
  x?: NodeType['x'];
  y?: NodeType['y'];
  id: NodeType['id'];
  data: NodeType['data'];
  handleOnNodeMouseEnter?: (nodeId: string) => void;
  handleOnNodeMouseLeave?: () => void;
  hidden?: boolean;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(
  ({ x, y, id, handleOnNodeMouseEnter, handleOnNodeMouseLeave, data, hidden }, ref) => {
    const navigate = useNavigate();
    const { dataEntityLineagePath } = useAppPaths();

    const lineageLink = React.useMemo(() => dataEntityLineagePath(id), [id]);

    const handleTitleClick = React.useCallback(() => {
      navigate(lineageLink);
    }, [lineageLink]);

    const onMouseEnter = useCallback(() => {
      if (handleOnNodeMouseEnter) {
        handleOnNodeMouseEnter(id);
      }
    }, [handleOnNodeMouseEnter]);

    return (
      <S.Container
        ref={ref}
        $translateX={x}
        $translateY={y}
        $hidden={hidden}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleOnNodeMouseLeave}
      >
        {data?.externalName ? (
          <>
            <S.TitleContainer variant='h4' onClick={handleTitleClick}>
              {data?.internalName || data?.externalName}
            </S.TitleContainer>
            <S.CountsContainer>
              <UpstreamArrow width={8} height={10} />
              <Typography variant='h5' sx={{ ml: 0.25, mr: 1 }}>
                {data?.parentsCount}
              </Typography>

              <DownstreamArrow width={8} height={10} />
              <Typography variant='h5' sx={{ ml: 0.25 }}>
                {data?.childrenCount}
              </Typography>
            </S.CountsContainer>
            <S.SourceContainer>
              <LabeledInfoItem label='Space' inline labelWidth={2}>
                {data?.dataSource?.namespace?.name}
              </LabeledInfoItem>
              <LabeledInfoItem label='Source' inline labelWidth={2}>
                {data?.dataSource?.name}
              </LabeledInfoItem>
            </S.SourceContainer>
          </>
        ) : (
          <>
            <EmptyIcon fill='black' stroke='black' width={28} height={28} />
            <S.OddrnContainer>
              <Typography variant='subtitle1'>ODDRN</Typography>
              <Typography variant='subtitle1' sx={{ wordBreak: 'break-all' }}>
                {data?.oddrn}
              </Typography>
            </S.OddrnContainer>
          </>
        )}
        <S.ClassesContainer>
          {data?.entityClasses?.map(entityClass => (
            <EntityClassItem
              key={entityClass.id}
              sx={{ mr: 0.5 }}
              entityClassName={entityClass.name}
            />
          ))}
        </S.ClassesContainer>
      </S.Container>
    );
  }
);

export default memo(Node);