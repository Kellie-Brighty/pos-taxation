import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface POSAgent {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessAddress: string;
  createdAt: string;
  status?: string;
  bankId?: string;
}

interface POSAgentContextType {
  agents: POSAgent[];
  addAgent: (agent: Omit<POSAgent, "id" | "createdAt">) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const POSAgentContext = createContext<POSAgentContextType | undefined>(
  undefined
);

export const POSAgentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [agents, setAgents] = useState<POSAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const agentsQuery = query(
          collection(db, "posAgents"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(agentsQuery);
        const agentsList = querySnapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber,
              businessName: data.businessName,
              businessAddress: data.businessAddress,
              createdAt:
                data.createdAt?.toDate().toISOString() ||
                new Date().toISOString(),
            } as POSAgent;
          }
        );

        setAgents(agentsList);
      } catch (err) {
        console.error("Error fetching POS agents:", err);
        setError("Failed to load POS agents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const addAgent = async (newAgent: Omit<POSAgent, "id" | "createdAt">) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "posAgents"), {
        ...newAgent,
        createdAt: serverTimestamp(),
      });

      // Add the newly created agent to the state
      const createdAgent: POSAgent = {
        ...newAgent,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };

      setAgents((prev) => [createdAgent, ...prev]);
    } catch (err) {
      console.error("Error adding POS agent:", err);
      setError("Failed to add POS agent. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <POSAgentContext.Provider value={{ agents, addAgent, loading, error }}>
      {children}
    </POSAgentContext.Provider>
  );
};

export const usePOSAgents = () => {
  const context = useContext(POSAgentContext);
  if (context === undefined) {
    throw new Error("usePOSAgents must be used within a POSAgentProvider");
  }
  return context;
};
