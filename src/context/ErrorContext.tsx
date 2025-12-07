import { createContext, useContext, useState, type ReactNode } from "react";

export interface ErrorContextType {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export default function ErrorContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [error, setError] = useState("");

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useError() {
  return useContext(ErrorContext);
}
