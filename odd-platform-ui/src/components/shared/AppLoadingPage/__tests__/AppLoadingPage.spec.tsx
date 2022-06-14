import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppLoadingPage from '../AppLoadingPage';

describe('AppLoadingPage', () => {
  const setupComponent = () => render(<AppLoadingPage />);

  it('AppCircularProgress renders correctly', () => {
    setupComponent();
    const appCircularProgress = screen.getByLabelText(
      'AppCircularProgress'
    );
    expect(appCircularProgress).toBeInTheDocument();
  });

  it('AppLoadingPage renders correctly', () => {
    setupComponent();
    const appLoadingPage = screen.getByLabelText('AppLoadingPage');
    expect(
      within(appLoadingPage).getByLabelText('AppCircularProgress')
    ).toBeInTheDocument();
  });
});
