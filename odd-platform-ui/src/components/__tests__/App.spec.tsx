import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';

import AppContainer from 'components/AppContainer';

describe('App', () => {
  describe('initial state', () => {
    beforeEach(() => {
      render(<AppContainer />, {
        pathname: '/',
      });
    });
    it('correctly renders toolbar', () => {
      const toolbar = screen.getByLabelText('AppToolbar');
      expect(toolbar).toBeInTheDocument();
      expect(within(toolbar).getByText('Platform')).toBeInTheDocument();
      expect(within(toolbar).getAllByLabelText('AppTab').length).toEqual(
        3
      );
      expect(within(toolbar).getByRole('button')).toBeInTheDocument();
    });
    it('toolbar button clicks and renders correctly', () => {
      const toolbar = screen.getByLabelText('AppToolbar');
      const menu = screen.getByLabelText('AppMenu');
      expect(toolbar).toBeInTheDocument();
      expect(
        within(menu).queryByLabelText('AppMenuItem')
      ).toBeInTheDocument();
      userEvent.click(menu);
      expect(
        within(menu).getByLabelText('AppMenuItem')
      ).toBeInTheDocument();
    });
  });
});
