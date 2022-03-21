import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppTooltip, { AppTooltipProps } from '../AppTooltip';

describe('AppTooltip', () => {
  const setupComponent = (props?: Partial<AppTooltipProps>) =>
    render(
      <AppTooltip title={() => 'AppTooltipTitle'} {...props}>
        AppTooltipChild
      </AppTooltip>
    );

  it('AppTooltip and children render correctly ', () => {
    setupComponent();
    const appTooltip = screen.getByRole('tooltip');
    const appTooltipChildrenContainer = screen.getByLabelText(
      'AppTooltipChildrenContainer'
    );
    expect(appTooltip).toHaveTextContent('AppTooltipChild');
    expect(appTooltip).toBeInTheDocument();
    expect(appTooltipChildrenContainer).toBeInTheDocument();
  });

  it('AppTooltip and children render correctly ', () => {
    setupComponent();
    const appTooltip = screen.getByRole('tooltip');
    expect(appTooltip).toHaveTextContent('AppTooltipChild');
    fireEvent.mouseEnter(appTooltip);
    fireEvent.mouseLeave(appTooltip);
    // todo: check is title open and close
  });

  // todo check AppTooltip theme styles

  // it('AppTooltip render light theme correctly ', () => {
  //   setupComponent({ type: 'dark' });
  //   const appTooltip = screen.getByRole('tooltip');
  //   expect(appTooltip).toHaveStyle({
  //     backgroundColor: '#FFFFFF',
  //     color: '#FFFFFF',
  //   });
  // });
  //
  // it('AppTooltip render dark theme correctly ', () => {
  //   setupComponent({ type: 'dark' });
  //   const appTooltip = screen.getByLabelText('AppTooltip');
  //   expect(appTooltip).toHaveStyle({
  //     backgroundColor: '#253858',
  //     color: '#42526E',
  //   });
  // });
});
