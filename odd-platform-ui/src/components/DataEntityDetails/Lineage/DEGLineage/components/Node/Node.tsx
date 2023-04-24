import React, { forwardRef, memo, useCallback } from 'react';
import { Typography } from '@mui/material';
import { useAppPaths } from 'lib/hooks';
import { useNavigate } from 'react-router-dom';
import { EntityClassItem, LabeledInfoItem } from 'components/shared/elements';
import { EmptyIcon } from 'components/shared/icons';
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
  fullView?: boolean;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(
  (
    { x, y, id, handleOnNodeMouseEnter, handleOnNodeMouseLeave, data, hidden, fullView },
    ref
  ) => {
    const navigate = useNavigate();
    const { dataEntityLineagePath, dataEntityOverviewPath } = useAppPaths();

    const lineageLink = React.useMemo(
      () =>
        data?.entityClasses?.some(entityClass => entityClass.name === 'DATA_QUALITY_TEST')
          ? dataEntityOverviewPath(id)
          : dataEntityLineagePath(id),
      [id, data?.entityClasses]
    );

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
            {fullView && (
              <S.SourceContainer>
                <LabeledInfoItem label='Space' inline labelWidth={2}>
                  {data?.dataSource?.namespace?.name}
                </LabeledInfoItem>
                <LabeledInfoItem label='Source' inline labelWidth={2}>
                  {data?.dataSource?.name}
                </LabeledInfoItem>
              </S.SourceContainer>
            )}
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
