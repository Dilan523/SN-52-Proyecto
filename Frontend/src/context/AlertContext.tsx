import React, { createContext, useState } from "react";
import type { ReactNode } from "react";

export type AlertType = "success" | "error";

export interface AlertContextType {
  alert: { message: string; type: AlertType } | null;
  showAlert: (message: string, type: AlertType) => void;
  clearAlert: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);

  const showAlert = (message: string, type: AlertType) => {
    setAlert({ message, type });
    // Mostrara una Alerta de 4 segundos
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const clearAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
