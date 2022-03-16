import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppTextField, { AppTextFieldProps } from '../AppTextField';

describe('AppTextField', () => {
  const setupComponent = (props?: Partial<AppTextFieldProps>) =>
    render(<AppTextField {...props} />);

  it('AppTextField and children render correctly ', () => {
    setupComponent();
    const appTextField = screen.getByLabelText('AppTextField');
    expect(appTextField).toBeInTheDocument();
  });

  it('CircularProgress renders in AppTextField correctly ', () => {
    setupComponent({
      customStartAdornment: { variant: 'loader', showAdornment: true },
    });
    const appTextFieldCircularProgress = screen.getByLabelText(
      'AppTextFieldCircularProgress'
    );
    expect(appTextFieldCircularProgress).toBeInTheDocument();
  });

  it('CircularProgress do not render in AppTextField ', () => {
    setupComponent();
    const appTextFieldCircularProgress = screen.queryByLabelText(
      'AppTextFieldCircularProgress'
    );
    expect(appTextFieldCircularProgress).toBeNull();
  });
});
