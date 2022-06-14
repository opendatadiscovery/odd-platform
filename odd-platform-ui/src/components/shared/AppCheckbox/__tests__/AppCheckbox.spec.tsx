import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppCheckbox, { AppCheckboxProps } from '../AppCheckbox';

describe('AppCheckbox', () => {
  const setupComponent = (props?: Partial<AppCheckboxProps>) =>
    render(<AppCheckbox {...props} />);

  it('AppCheckbox renders correctly', () => {
    setupComponent();
    const appCheckbox = screen.getByLabelText('AppCheckbox');
    expect(appCheckbox).toBeInTheDocument();
  });

  it('AppCheckbox should return right styles for sx props', () => {
    setupComponent({ sx: { mr: 1 } });
    const appCheckbox = screen.getByLabelText('AppCheckbox');
    expect(appCheckbox).toHaveStyle({
      marginRight: '8px',
    });
  });
});
