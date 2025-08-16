import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { api as API_BASE } from "../api/api";
import { useAuth } from "./AuthProvider";

interface SocketContextType {
  socket: Socket | null;
  subscribeToBookProgress: (callback: (data: any) => void) => void;
  unsubscribeFromBookProgress: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth(); // Get token from AuthContext

  useEffect(() => {
    if (!token) {
      // Disconnect socket if token is removed (e.g., on logout)
      if (socket) {
        socket.disconnect();
        setSocket(null);
        console.log("Socket disconnected due to no token");
        toast.warn("Disconnected from WebSocket server", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          toastId: "websocket-disconnect",
        });
      }
      return;
    }

    // Initialize Socket.IO only if token is present
    const newSocket = io(API_BASE, {
      auth: {
        token,
      },
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      toast.success("Connected to WebSocket server", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        toastId: "websocket-connect",
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      toast.error("WebSocket connection failed. Retrying...", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        toastId: "websocket-connect-error",
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      toast.warn("Disconnected from WebSocket server", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        toastId: "websocket-disconnect",
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
      setSocket(null);
    };
  }, [token]); // Re-run effect when token changes

  // Manage book_progress event subscriptions
  const subscribeToBookProgress = (callback: (data: any) => void) => {
    if (socket) {
      socket.on("book_progress", callback);
      console.log("Subscribed to book_progress");
    }
  };

  const unsubscribeFromBookProgress = (callback: (data: any) => void) => {
    if (socket) {
      socket.off("book_progress", callback);
      console.log("Unsubscribed from book_progress");
    }
  };

  return (
    <SocketContext.Provider value={{ socket, subscribeToBookProgress, unsubscribeFromBookProgress }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};