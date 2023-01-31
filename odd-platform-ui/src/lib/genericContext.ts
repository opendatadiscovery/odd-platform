import React from 'react';

export const createGenericContext = <T>() => {
  const genericContext = React.createContext<T | undefined>(undefined);

  const useGenericContext = () => {
    const contextIsDefined = React.useContext(genericContext);
    if (!contextIsDefined) {
      throw new Error('useGenericContext must be used within a Provider');
    }
    return contextIsDefined;
  };

  return [useGenericContext, genericContext.Provider] as const;
};
