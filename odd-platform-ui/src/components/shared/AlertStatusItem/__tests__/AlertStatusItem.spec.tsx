import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AlertStatusItem, { AlertStatusItemProps } from '../AlertStatusItem';
import { AlertStatus } from '../../../../generated-sources';

describe('AlertStatusItem', () => {
  const setupComponent = (props: AlertStatusItemProps) =>
    render(<AlertStatusItem {...props} />);

  it('AlertStatusItem renders correctly for typeName open', () => {
    setupComponent({ typeName: AlertStatus.OPEN });
    const alertStatusItem = screen.getByLabelText('AlertStatusItem');
    expect(alertStatusItem).toBeInTheDocument();
  });

  it('AlertStatusItem should return right styles for typeName open', () => {
    setupComponent({ typeName: AlertStatus.OPEN });
    const alertStatusItem = screen.getByLabelText('AlertStatusItem');
    expect(alertStatusItem).toHaveStyle({
      backgroundColor: '#FFCCCC',
      borderColor: '#FF9999',
    });
  });

  it('AlertStatusItem should return right styles for typeName resolved', () => {
    setupComponent({ typeName: AlertStatus.RESOLVED });
    const alertStatusItem = screen.getByLabelText('AlertStatusItem');
    expect(alertStatusItem).toHaveStyle({
      backgroundColor: '#CCE6FF',
      borderColor: '#99CCFF',
    });
  });

  it('AlertStatusItem container should return right title', () => {
    setupComponent({ typeName: AlertStatus.RESOLVED });
    const alertStatusItemContainer = screen.getByLabelText(
      'AlertStatusItemContainer'
    );
    expect(alertStatusItemContainer).toHaveTextContent('Resolved');
  });
});
