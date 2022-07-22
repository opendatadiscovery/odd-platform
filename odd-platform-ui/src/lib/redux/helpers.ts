export const assignWith = <TargetType, SourceType>(
  target: TargetType,
  source: SourceType,
  customizer: (targetValue: any, sourceValue: any) => any
) => {
  const targetEntries = Object.entries(source);
  const sourceEntries = Object.entries(source);
  const result = targetEntries.map(([targetKey, targetValue], idx) => {
    const { 1: sourceValue } = sourceEntries[idx];
    return [targetKey, customizer(targetValue, sourceValue)];
  });
  return Object.fromEntries(result);
};

export const createActionType = (actionPrefix: string, action: string) =>
  `${actionPrefix}/${action}`;
