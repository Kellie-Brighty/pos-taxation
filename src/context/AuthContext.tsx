import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export type UserRole = "admin" | "bank" | "pos_agent" | "government";

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
  createdAt: any;
  lastLogin: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserData>
  ) => Promise<UserData>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            setUserData(userData);

            // Update last login
            await setDoc(
              userDocRef,
              { lastLogin: serverTimestamp() },
              { merge: true }
            );
          } else {
            console.error("No user data found in Firestore");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserData>
  ) => {
    try {
      setError(null);
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        ...additionalData,
      };

      await setDoc(doc(db, "users", user.uid), userData);
      setUserData(userData);

      // Redirect based on role
      return userData;
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || "Failed to create an account. Please try again.");
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      // User data will be fetched in the onAuthStateChanged listener
    } catch (err: any) {
      console.error("Error signing in:", err);
      setError(
        err.message ||
          "Failed to sign in. Please check your credentials and try again."
      );
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error("Error signing out:", err);
      setError(err.message || "Failed to sign out. Please try again.");
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(
        err.message || "Failed to send password reset email. Please try again."
      );
      throw err;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
