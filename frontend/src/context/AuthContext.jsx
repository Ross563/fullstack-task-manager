// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(true);
//   const [currUser, setCurrUser] = useState(null);
//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, setIsAuthenticated, currUser, setCurrUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currUser, setCurrUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, currUser, setCurrUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
