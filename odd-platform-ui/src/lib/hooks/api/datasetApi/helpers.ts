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
    if (item.states[firstVersionId] && child.states[firstVersionId]) {
      return (
        item.states[firstVersionId]?.parentFieldId === child.states[firstVersionId]?.id
      );
    }

    if (item.states[secondVersionId] && child.states[secondVersionId]) {
      return (
        item.states[secondVersionId]?.parentFieldId === child.states[secondVersionId]?.id
      );
    }

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
}

export function makeCompareFieldsTree({
  data,
  firstVersionId,
  secondVersionId,
}: MakeTreeArgs) {
  return data
    .filter(item => {
      if (item.states[firstVersionId]) {
        return !item.states[firstVersionId]?.parentFieldId;
      }

      if (item.states[secondVersionId]) {
        return !item.states[secondVersionId]?.parentFieldId;
      }

      return false;
    })
    .map(root =>
      buildChild({
        data,
        currentChild: root,
        firstVersionId,
        secondVersionId,
      })
    );
}
