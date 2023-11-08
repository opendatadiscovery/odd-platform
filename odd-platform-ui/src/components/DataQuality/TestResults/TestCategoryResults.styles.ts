import type { DataEntityRunStatus } from 'generated-sources';
import styled, { css } from 'styled-components';

export const TestCategoryResultsWrapper = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 560px;
    background: ${theme.palette.backgrounds.tertiary};
    padding: ${theme.spacing(1)} ${theme.spacing(2)};
    border-radius: ${theme.spacing(1)};
  `
);

export const TestCategoryResults = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing(1)};
  `
);

interface Status {
  $status: DataEntityRunStatus;
}
export const TestCategoryResultsItem = styled.div<Status>(
  ({ theme, $status }) => css`
    text-align: center;
    width: ${theme.spacing(5)};
    padding: ${theme.spacing(1 / 2)} ${theme.spacing(1)};
    border-radius: ${theme.spacing(1 / 2)};
    color: ${theme.palette.runStatus[$status].color};
    background: ${theme.palette.backgrounds.default};
  `
);
