import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export interface AuthUser {
    email: string;
    name: string;
    avatar?: string;
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signin: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    role: string,
    token: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        // Initialize state from localStorage if available
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    // Fetch user on mount to check authentication status
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setUser(null);
                    localStorage.removeItem("user");
                    console.log("No token found, setting user to null");
                    return;
                }
                const res = await axios.get("/api/checkLogged", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.data.user) {
                    console.error("Invalid user response from /api/checkLogged:", res.data);
                    throw new Error("No user data received");
                }
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                console.log("Fetched user:", res.data.user);
            } catch (err) {
                console.error("Fetch user error:", err);
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Signin function to authenticate user and set token
    const signin = async (email: string, password: string) => {
        try {
            const res = await axios.post("/api/login", { email, password });
            const token = res.data.access_token;
            if (!token) {
                throw new Error("No token received");
            }
            localStorage.setItem("token", token);
            localStorage.setItem("role", res.data.role);

            const userRes = await axios.get("/api/checkLogged", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!userRes.data.user) {
                console.error("Invalid user response from /api/checkLogged:", userRes.data);
                throw new Error("No user data received");
            }

            setUser(userRes.data.user);
            localStorage.setItem("user", JSON.stringify(userRes.data.user));
            console.log("Signed in user:", userRes.data.user);

            toast.success("Successfully signed in!", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (err) {
            console.error("Signin error:", err);
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            toast.error("Failed to sign in. Please check your credentials.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
            throw err;
        }
    };

    // Logout function to clear authentication data
    const logout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await axios.post(
                    "/api/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
            console.log("User logged out, user set to null");
            toast.success("Successfully signed out!", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        } catch (err) {
            console.error("Logout error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
            toast.error("Failed to sign out. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}