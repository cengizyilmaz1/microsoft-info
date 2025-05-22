import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../services/graphConfig';
import { GraphService } from '../services/GraphService';

interface AuthContextType {
  account: AccountInfo | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  account: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [msalInstance] = useState(() => new PublicClientApplication(msalConfig));

  useEffect(() => {
    const currentAccounts = msalInstance.getAllAccounts();
    if (currentAccounts.length > 0) {
      setAccount(currentAccounts[0]);
      initializeGraphClient(currentAccounts[0]);
    }
  }, [msalInstance]);

  const initializeGraphClient = async (account: AccountInfo) => {
    const graphService = GraphService.getInstance();
    await graphService.initializeGraphClient(account);
  };

  const login = async () => {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      if (response.account) {
        setAccount(response.account);
        await initializeGraphClient(response.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutPopup();
      setAccount(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      account,
      isAuthenticated: !!account,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};