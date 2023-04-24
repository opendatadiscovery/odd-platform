import React from 'react';
import {
  AlertAnomalyIcon,
  AlertDQTestIcon,
  AlertJobIcon,
  AlertSchemaIcon,
} from 'components/shared/icons';
import { AlertStatus, AlertType, type DataEntityAlertConfig } from 'generated-sources';
import type { Alert } from 'redux/interfaces';
import styled from 'styled-components';

interface AlertIconProps {
  status?: Alert['status'];
  type?: Alert['type'];
  name?: keyof DataEntityAlertConfig;
}

export const Container = styled('div')<{
  $hasOutline: boolean;
  $alertStatus?: Alert['status'];
}>(({ theme, $hasOutline, $alertStatus }) => {
  const setBackGroundColor = () => {
    if (!$hasOutline) return 'transparent';

    return $alertStatus === 'OPEN'
      ? theme.palette.toast.error
      : theme.palette.toast.success;
  };

  return {
    height: 'fit-content',
    padding: theme.spacing($hasOutline ? 1.25 : 0),
    borderRadius: theme.spacing($hasOutline ? 1 : 0),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: setBackGroundColor(),
  };
});

const AlertIcon: React.FC<AlertIconProps> = ({ name, type, status }) => {
  const alertTypes = new Map<Alert['type'], Array<string | undefined>>([
    [
      AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
      ['incompatibleSchemaHaltUntil', AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA],
    ],
    [
      AlertType.DISTRIBUTION_ANOMALY,
      ['distributionAnomalyHaltUntil', AlertType.DISTRIBUTION_ANOMALY],
    ],
    [AlertType.FAILED_JOB, ['failedJobHaltUntil', AlertType.FAILED_JOB]],
    [AlertType.FAILED_DQ_TEST, ['failedDqTestHaltUntil', AlertType.FAILED_DQ_TEST]],
  ]);

  const icon = React.useMemo(() => {
    const width = '24px';
    const height = '24px';
    const fill = status === AlertStatus.OPEN ? '#F2330D' : '#A8B0BD';

    if (alertTypes.get(AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA)?.includes(name || type))
      return <AlertSchemaIcon fill={fill} width={width} height={height} />;

    if (alertTypes.get(AlertType.FAILED_JOB)?.includes(name || type))
      return <AlertJobIcon fill={fill} width={width} height={height} />;

    if (alertTypes.get(AlertType.FAILED_DQ_TEST)?.includes(name || type))
      return <AlertDQTestIcon fill={fill} width={width} height={height} />;

    if (alertTypes.get(AlertType.DISTRIBUTION_ANOMALY)?.includes(name || type))
      return <AlertAnomalyIcon fill={fill} width={width} height={height} />;

    return null;
  }, [name]);

  return (
    <Container $hasOutline={!name} $alertStatus={status}>
      {icon}
    </Container>
  );
};

export default AlertIcon;
