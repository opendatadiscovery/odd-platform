import React from 'react';
import { within } from '@testing-library/react';
import { getByTestID, render } from 'lib/testHelpers';
import { PaperProps } from '@mui/material';
import AppPaper from '../AppPaper';

describe('AppPaper', () => {
  const setupComponent = (props?: Partial<PaperProps>) =>
    render(
      <AppPaper {...props}>
        <div>Paper content</div>
      </AppPaper>
    );

  it('AppPaper and children render correctly ', () => {
    setupComponent();
    const appPaper = getByTestID('AppPaper');
    expect(appPaper).toBeInTheDocument();
    expect(
      within(appPaper).getByText('Paper content')
    ).toBeInTheDocument();
  });
});
