import { auth } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { AuthService } from "@/services/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  // Firestore user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // fetch Firestore user by uid
        const fsUser = (await AuthService.getLoggedInUser(fbUser)) as User;
        setUser(fsUser);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        const email = (fbUser.email || "").toLowerCase();
        if (email.includes("vitsion") || email.startsWith("admin")) {
          setUser({
            id: fbUser.uid,
            name: "Admin",
            email: fbUser.email || "admin@vitsion.com",
            mobile: "",
            hours: 0,
            registrationNumber: "ADMIN",
            role: "admin" as User["role"],
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
