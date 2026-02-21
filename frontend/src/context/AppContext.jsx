import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [recentProjects] = useState([]); // Could be lifted from mockData or API later
  return (
    <AppContext.Provider value={{ recentProjects }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  return ctx ?? {};
}
