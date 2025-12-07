import { type ReactNode } from "react";
import AuthContextProvider from "./AuthContext";
import LoaderContextProvider from "./LoaderContext";
import ErrorContextProvider from "./ErrorContext";
import AdminTabContextProvider from "./AdminViewContext";
import AlertContextProvider from "./AlertContext";

export default function GlobalContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ErrorContextProvider>
      <AlertContextProvider>
        <AuthContextProvider>
          <AdminTabContextProvider>
            <LoaderContextProvider>{children}</LoaderContextProvider>
          </AdminTabContextProvider>
        </AuthContextProvider>
      </AlertContextProvider>
    </ErrorContextProvider>
  );
}
