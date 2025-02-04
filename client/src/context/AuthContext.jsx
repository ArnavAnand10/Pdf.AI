import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [signupData, setSignupData] = useState(null);

  return (
    <AuthContext.Provider value={{ signupData, setSignupData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
