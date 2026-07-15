import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { AuthContext } from '../features/auth/context/AuthContext';
import { socketService } from '../services/socketService';

interface SocketContextType {
  socketService: typeof socketService;
}

const SocketContext = createContext<SocketContextType>({ socketService });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated. Initializing socket connection.');
      socketService.connect(token);
    } else {
      console.log('User unauthenticated. Disconnecting socket.');
      socketService.disconnect();
    }

    // Clean up connection on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socketService }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
