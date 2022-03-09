import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import OverviewContainer from 'components/Overview/OverviewContainer';
import { OverviewProps } from 'components/Overview/Overview';

describe('Overview', () => {
  const setupWrapper = (props?: Partial<OverviewProps>) => {
    render(
      <OverviewContainer
        isMainOverviewContentFetching={false}
        {...props}
      />
    );
  };

  describe('Main overview content is not fetching', () => {
    it('correctly renders overview', () => {
      setupWrapper({
        // identity: undefined,
        isMainOverviewContentFetching: false,
      });

      // todo: tests if isMainOverviewContentFetching = false
      const overviewSkeleton = screen.queryByLabelText('OverviewSkeleton');
      // const mainSearch = screen.getByLabelText('MainSearch');
      expect(overviewSkeleton).toBeInTheDocument();
      // expect(mainSearch).toBeInTheDocument();
    });
  });
  describe('Main overview content is fetching', () => {
    it('correctly renders overview skeleton', () => {
      setupWrapper({ isMainOverviewContentFetching: true });
      const overviewSkeleton = screen.getByLabelText('OverviewSkeleton');
      expect(overviewSkeleton).toBeInTheDocument();
    });
  });
  describe('Identity', () => {
    // todo: tests if identityFetched: true, identity: undefined
    // it('Identity renders correctly', () => {
    //   setupWrapper({
    //     identityFetched: true,
    //     identity: { identity: { username: 'userNameString' } },
    //   });
    //   const identity = screen.getByLabelText('Identity');
    //   expect(identity).toBeInTheDocument();
    // });
  });
});
