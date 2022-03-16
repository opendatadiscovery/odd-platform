import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppRadio, { AppRadioProps } from '../AppRadio';

describe('AppRadio', () => {
  const setupComponent = (props?: Partial<AppRadioProps>) =>
    render(<AppRadio {...props} />);

  it('AppRadio renders correctly', () => {
    setupComponent();
    const appRadio = screen.getByLabelText('AppRadio');
    expect(appRadio).toBeInTheDocument();
  });
});
