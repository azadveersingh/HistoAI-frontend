// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// export interface AuthUser {
//   email: string;
//   name: string;
//   avatar?: string;
//   role: string;
// }

// export function useAuth() {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch user on mount
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setUser(null);
//           return;
//         }
//         const res = await axios.get("/api/checkLogged", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUser(res.data.user);
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   // Logout function
//   const logout = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (token) {
//         // Optional: Call logout endpoint if implemented in backend
//         await axios.post(
//           "/api/logout", // Note: Backend does not have this endpoint yet
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       }
//       localStorage.removeItem("token");
//       localStorage.removeItem("role");
//       setUser(null);
//       toast.success("Successfully signed out!", {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });
//     } catch (err: any) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("role");
//       setUser(null);
//       toast.error("Failed to sign out. Please try again.", {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });
//     }
//   };

//   return { user, setUser, loading, logout };
// }