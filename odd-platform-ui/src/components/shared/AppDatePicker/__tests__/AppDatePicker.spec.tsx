import React from 'react';
import { getByLabelText, render } from 'lib/testHelpers';
import AppDatePicker, { AppDatePickerProps } from '../AppDatePicker';

const onChangeMock = jest.fn();
describe('AppDatePicker', () => {
  const setupComponent = (props?: Partial<AppDatePickerProps>) =>
    render(
      <AppDatePicker
        onChange={onChangeMock}
        defaultDate="22.02.1993"
        {...props}
      />
    );

  it('AppDatePicker renders correctly', () => {
    setupComponent();
    const appDatePicker = getByLabelText('AppDatePicker');
    expect(appDatePicker).toBeInTheDocument();
  });

  it('AppDatePicker should return right styles for sx props', () => {
    setupComponent({ sx: { mr: 1 } });
    const appDatePicker = getByLabelText('AppDatePicker');
    expect(appDatePicker).toHaveStyle({
      marginRight: '8px',
    });
  });

  it('AppDatePicker should display "date picker error" error', () => {
    setupComponent({
      showInputError: true,
      inputHelperText: 'date picker error',
    });
    const appDatePicker = getByLabelText('AppDatePicker');
    expect(
      appDatePicker.querySelector('#mui-1-helper-text')
    ).toHaveTextContent('date picker error');
  });
});
