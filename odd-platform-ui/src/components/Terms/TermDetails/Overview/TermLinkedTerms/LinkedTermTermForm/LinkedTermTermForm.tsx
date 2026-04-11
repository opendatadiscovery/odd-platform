import React, { type FC, useCallback } from 'react';
import type { LinkedTerm } from 'generated-sources';
import { useAddLinkedTermToTerm } from 'lib/hooks';
import { AssignTermForm } from 'components/shared/elements';

interface AssignLinkedTermTermFormProps {
  openBtnEl: JSX.Element;
  termId: number;
  handleAddTerm: (linkedTerm: LinkedTerm) => void;
}

const LinkedTermTermForm: FC<AssignLinkedTermTermFormProps> = ({
  openBtnEl,
  termId,
  handleAddTerm,
}) => {
  const {
    isPending,
    isSuccess,
    mutateAsync: addTerm,
  } = useAddLinkedTermToTerm({ termId });

  const onSubmit = useCallback(
    (clearState: () => void) =>
      async ({ termId: linkedTermId }: { termId: number }) => {
        const linkedTerm = await addTerm({
          termId,
          linkedTermFormData: {
            linkedTermId,
          },
        });

        handleAddTerm(linkedTerm);
        clearState();
      },
    [addTerm, handleAddTerm]
  );

  return (
    <AssignTermForm
      onSubmit={onSubmit}
      openBtnEl={openBtnEl}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isPending}
    />
  );
};

export default LinkedTermTermForm;
