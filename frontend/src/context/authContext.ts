import { createContext } from "react";
import { TypeAuthContext } from "../types/user.types";

export const AuthUserContext = createContext<TypeAuthContext | undefined>(undefined)