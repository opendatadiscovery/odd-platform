import styled, { css } from 'styled-components';
import type { DataEntityRunStatus } from 'generated-sources';

export const Container = styled.section(
  ({ theme }) => css`
    display: grid;
    justify-content: center;
    margin-top: ${theme.spacing(5)};
    gap: ${theme.spacing(3)};
  `
);

export const SectionWrapper = styled.div(
  ({ theme }) => css`
    display: flex;
    padding: ${theme.spacing(3)};
    border: 1px solid ${theme.palette.border.primary};
    border-radius: ${theme.spacing(1)};
  `
);

export const DashboardLegend = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    gap: ${theme.spacing(4)};
  `
);

interface DashboardLegendItemProps {
  $status: DataEntityRunStatus;
}

export const DashboardLegendItem = styled.span<DashboardLegendItemProps>(
  ({ theme, $status }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing(1)};

    &::before {
      content: '';
      width: ${theme.spacing(1)};
      height: ${theme.spacing(1)};
      background-color: ${theme.palette.runStatus[$status].color};
      border-radius: 50%;
    }
  `
);
