import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppErrorPage, { AppErrorPageProps } from '../AppErrorPage';

describe('AppErrorPage', () => {
  const setupComponent = (props?: Partial<AppErrorPageProps>) =>
    render(<AppErrorPage fetchStatus="errorFetching" {...props} />);

  it('AppErrorPage renders correctly ', () => {
    setupComponent();
    const appErrorPage = screen.getByLabelText('AppErrorPage');
    expect(appErrorPage).toBeInTheDocument();
  });

  it('AppErrorPage do not renders if status is not equals "errorFetching"', () => {
    setupComponent({ fetchStatus: 'notFetched' });
    expect(screen.queryByLabelText('AppErrorPage')).toBeNull();
  });

  it('AppErrorPage should return error statusCode and statusText', () => {
    setupComponent({
      error: {
        statusCode: 'TestStatusCode',
        statusText: 'TestStatusText',
      },
    });
    const appErrorPage = screen.getByLabelText('AppErrorPage');
    expect(appErrorPage).toHaveTextContent('TestStatusCode');
    expect(appErrorPage).toHaveTextContent('TestStatusText');
  });

  it('AppErrorPage should return error statusTexts default message', () => {
    setupComponent();
    const appErrorPage = screen.getByLabelText('AppErrorPage');
    expect(appErrorPage).toHaveTextContent('Unknown Error');
  });
});
