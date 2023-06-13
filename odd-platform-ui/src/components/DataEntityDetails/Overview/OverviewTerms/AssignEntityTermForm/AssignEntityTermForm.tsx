import React from 'react';
import type { DataEntityTermFormData } from 'generated-sources';
import { AssignTermForm } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { addDataEntityTerm } from 'redux/thunks';
import { getDataEntityAddTermStatuses } from 'redux/selectors';

interface AssignEntityTermFormProps {
  openBtnEl: JSX.Element;
  dataEntityId: number;
}

const AssignEntityTermForm: React.FC<AssignEntityTermFormProps> = ({
  openBtnEl,
  dataEntityId,
}) => {
  const dispatch = useAppDispatch();

  const { isLoading, isLoaded } = useAppSelector(getDataEntityAddTermStatuses);

  const onSubmit =
    (clearState: () => void) =>
    ({ termId }: DataEntityTermFormData) => {
      const params = { dataEntityId, dataEntityTermFormData: { termId } };

      dispatch(addDataEntityTerm(params)).then(() => {
        clearState();
      });
    };

  return (
    <AssignTermForm
      onSubmit={onSubmit}
      openBtnEl={openBtnEl}
      handleCloseSubmittedForm={isLoaded}
      isLoading={isLoading}
    />
  );
};

export default AssignEntityTermForm;
