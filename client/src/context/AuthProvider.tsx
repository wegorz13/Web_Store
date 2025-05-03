import { createContext, useState } from "react";

const AuthContext = createContext({});

declare global {
  interface Auth {
    id: number;
    email: string;
    password: string;
    accessToken: string;
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState<Auth>({
    id: -1,
    email: "",
    password: "",
    accessToken: "",
  });

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
