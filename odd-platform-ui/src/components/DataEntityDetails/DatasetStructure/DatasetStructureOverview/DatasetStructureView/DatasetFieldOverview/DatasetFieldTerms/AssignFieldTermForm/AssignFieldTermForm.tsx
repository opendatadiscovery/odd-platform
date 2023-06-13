import React, { type FC, useCallback } from 'react';
import type { DataEntityTermFormData, TermRef } from 'generated-sources';
import { useAddDatasetFieldTerm } from 'lib/hooks';
import { AssignTermForm } from 'components/shared/elements';

interface AssignFieldTermFormProps {
  openBtnEl: JSX.Element;
  datasetFieldId: number;
  handleAddTerm: (term: TermRef) => void;
}

const AssignFieldTermForm: FC<AssignFieldTermFormProps> = ({
  openBtnEl,
  datasetFieldId,
  handleAddTerm,
}) => {
  const { isLoading, isSuccess, mutateAsync: addTerm } = useAddDatasetFieldTerm();

  const onSubmit = useCallback(
    (clearState: () => void) =>
      ({ termId }: DataEntityTermFormData) => {
        addTerm({ datasetFieldId, termId }).then(term => {
          handleAddTerm(term);
          clearState();
        });
      },
    [addTerm, handleAddTerm]
  );

  return (
    <AssignTermForm
      onSubmit={onSubmit}
      openBtnEl={openBtnEl}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isLoading}
    />
  );
};

export default AssignFieldTermForm;
