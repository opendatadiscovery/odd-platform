import styled, { css } from 'styled-components';
import type { DataEntityRunStatus } from 'generated-sources';

export const Container = styled.section(
  ({ theme }) => css`
    display: grid;
    justify-content: center;
    margin-bottom: ${theme.spacing(5)};
    gap: ${theme.spacing(3)};
  `
);

export const Section = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: fit-content;
    padding: ${theme.spacing(3)};
    border: 1px solid ${theme.palette.border.primary};
    border-radius: ${theme.spacing(1)};
    gap: ${theme.spacing(2)};
  `
);

interface FlexDirection {
  $direction?: 'column' | 'row';
}

export const SubSection = styled.div<FlexDirection>(
  ({ theme, $direction = 'row' }) => css`
    display: flex;
    flex-direction: ${$direction};
    flex-wrap: wrap;
    gap: ${theme.spacing(3)};
  `
);

export const DashboardLegend = styled.div(
  ({ theme }) => css`
    display: flex;
    gap: ${theme.spacing(4)};
  `
);

export const ChartWrapper = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding-top: ${theme.spacing(2)};
    background: ${theme.palette.backgrounds.tertiary};
    border-radius: ${theme.spacing(1)};
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
