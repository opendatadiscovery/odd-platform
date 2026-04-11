import React from 'react';
import { Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import type { CSSObject } from 'styled-components';
import styled, { css } from 'styled-components';

const SkeletonItemBox = styled('div')<{ $flex?: CSSObject['flex'] }>(
  ({ theme, $flex = '1 0 16%' }) => css`
    margin: ${theme.spacing(1, 0, 1.5, 0)};
    padding-left: ${theme.spacing(1)};
    flex: ${$flex};
  `
);

const SkeletonContainer = styled('div')(
  ({ theme }) => css`
    display: flex;
    padding: ${theme.spacing(1.5, 0, 1, 0)};
    border-bottom: 1px solid ${theme.palette.divider};
  `
);

const RelationshipsSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={3}
    renderContent={({ randWidth, key }) => (
      <SkeletonContainer key={key}>
        <SkeletonItemBox $flex='1 0 33%'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SkeletonItemBox>
        <SkeletonItemBox $flex='1 0 19%'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SkeletonItemBox>
        <SkeletonItemBox>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SkeletonItemBox>
        <SkeletonItemBox>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SkeletonItemBox>
        <SkeletonItemBox>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SkeletonItemBox>
      </SkeletonContainer>
    )}
  />
);
export default RelationshipsSkeleton;
