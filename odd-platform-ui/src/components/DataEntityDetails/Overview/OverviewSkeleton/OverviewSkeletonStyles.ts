import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const LargeItemHeight = '34px';
const SmallItemHeight = '26px';

export const Container = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(6),
}));

export const OverviewMetadataSkeletonContainer = styled(Grid)(
  ({ theme }) => ({
    marginTop: theme.spacing(6),
  })
);

export const OverviewAboutSkeletonContainer = styled(Grid)(
  ({ theme }) => ({
    marginTop: theme.spacing(6),
  })
);

export const LargeItem = styled(Grid)(() => ({
  height: LargeItemHeight,
}));

export const SmallItem = styled(Grid)(() => ({
  height: SmallItemHeight,
}));

export const SmallItemContainer = styled(Grid)(({ theme }) => ({
  height: SmallItemHeight,
  marginTop: theme.spacing(6),
}));

export const SkeletonLeftSide = styled(Grid)(({ theme }) => ({
  paddingRight: theme.spacing(6),
}));

export const TabItem = styled(Grid)(({ theme }) => ({
  '& > *': { marginRight: theme.spacing(1) },
  height: LargeItemHeight,
}));
