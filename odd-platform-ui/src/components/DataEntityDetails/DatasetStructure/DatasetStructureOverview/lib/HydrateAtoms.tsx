import React, { type FC, type PropsWithChildren } from 'react';
import { useHydrateAtoms } from 'jotai/react/utils';
import { type WritableAtom } from 'jotai';

export type InitialValues = [WritableAtom<unknown, any[], any>, unknown][];

interface HydrateAtomsProps extends PropsWithChildren {
  initialValues: InitialValues;
}

const HydrateAtoms: FC<HydrateAtomsProps> = ({ initialValues, children }) => {
  useHydrateAtoms(initialValues);

  return <>{children}</>;
};

export default HydrateAtoms;
