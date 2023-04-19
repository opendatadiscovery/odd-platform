import type { DataSetVersionDiff } from 'lib/interfaces';

interface BuildChildArgs {
  data: DataSetVersionDiff[];
  currentChild: DataSetVersionDiff;
  firstVersionId: number;
  secondVersionId: number;
}

function buildChild({
  data,
  currentChild,
  firstVersionId,
  secondVersionId,
}: BuildChildArgs): DataSetVersionDiff {
  const child: DataSetVersionDiff = { ...currentChild, childFields: [] };

  const childFields = data.filter(item => {
    const firstItemState = item.states[firstVersionId];
    const secondItemState = item.states[secondVersionId];
    const firstChildState = child.states[firstVersionId];
    const secondChildState = child.states[secondVersionId];

    if (firstItemState && firstChildState)
      return firstItemState?.parentFieldId === firstChildState?.id;

    if (secondItemState && secondChildState)
      return secondItemState?.parentFieldId === secondChildState?.id;

    return false;
  });

  if (childFields.length > 0) {
    childFields.forEach(item => {
      const args = { data, currentChild: item, firstVersionId, secondVersionId };
      return child.childFields?.push(buildChild(args));
    });
  }

  return child;
}

interface MakeTreeArgs {
  data: DataSetVersionDiff[];
  firstVersionId: number;
  secondVersionId: number;
  showChangesOnly?: boolean;
}

export function makeCompareFieldsTree({
  data,
  firstVersionId,
  secondVersionId,
  showChangesOnly,
}: MakeTreeArgs) {
  const excludeChildren = (item: DataSetVersionDiff) => {
    const firstState = item.states[firstVersionId];
    const secondState = item.states[secondVersionId];

    if (firstState) return !firstState?.parentFieldId;
    if (secondState) return !secondState?.parentFieldId;

    return false;
  };

  const excludeNoChangedDiffs = (item: DataSetVersionDiff) => {
    if (item.childFields?.some(child => child.status !== 'NO_CHANGES')) {
      return true;
    }
    return item.status !== 'NO_CHANGES';
  };

  const nestedData = data.filter(excludeChildren).map(root =>
    buildChild({
      data,
      currentChild: root,
      firstVersionId,
      secondVersionId,
    })
  );

  return showChangesOnly ? nestedData.filter(excludeNoChangedDiffs) : nestedData;
}
