interface UseLocalStorage {
  showAssociationAcceptedMessage: boolean;
}

export const setLocalStorageValue = (
  key: keyof UseLocalStorage,
  value: boolean
  // eslint-disable-next-line consistent-return
) => {
  localStorage.setItem(key, String(value));
};

export const getLocalStorageValue = (
  key: keyof UseLocalStorage
  // eslint-disable-next-line consistent-return
): UseLocalStorage[typeof key] | undefined => {
  const saved = localStorage.getItem(key);

  if (saved && key === 'showAssociationAcceptedMessage') {
    return saved !== 'true';
  }
};

export const useLocalStorage = () => ({
  getLocalStorageValue,
  setLocalStorageValue,
});
