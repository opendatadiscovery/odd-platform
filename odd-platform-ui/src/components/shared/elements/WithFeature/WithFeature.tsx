import React from 'react';
import { type Feature } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getActiveFeatures } from 'redux/selectors';

interface WithFeatureProps extends React.PropsWithChildren {
  featureName: Feature;
  renderContent?: ({
    isFeatureEnabled,
  }: {
    isFeatureEnabled: boolean;
  }) => JSX.Element | null;
}

const WithFeature: React.FC<WithFeatureProps> = ({
  featureName,
  renderContent,
  children,
}) => {
  const activeFeatures = useAppSelector(getActiveFeatures);

  const isFeatureEnabled = React.useMemo(
    () => activeFeatures.includes(featureName),
    [activeFeatures, featureName]
  );

  if (renderContent) {
    return <>{renderContent({ isFeatureEnabled })}</>;
  }

  if (children) {
    return isFeatureEnabled ? <>{children}</> : null;
  }

  return null;
};

export default WithFeature;
