import React, { createContext } from "react";

export type Role = "lector" | "editor" | "escritor";

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  foto?: string;
  rol: Role;
}

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});
