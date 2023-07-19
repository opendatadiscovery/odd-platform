import React, { type FC } from 'react';
import type { DataEntityStatus } from 'generated-sources';
import SelectableEntityStatus from './SelectableEntityStatus/SelectableEntityStatus';
import DefaultEntityStatus from './DefaultEntityStatus/DefaultEntityStatus';

interface EntityStatusProps {
  entityStatus: DataEntityStatus;
  selectable?: boolean;
}

const EntityStatus: FC<EntityStatusProps> = ({ entityStatus, selectable = false }) =>
  selectable ? (
    <SelectableEntityStatus entityStatus={entityStatus} />
  ) : (
    <DefaultEntityStatus entityStatus={entityStatus} />
  );

export default EntityStatus;
