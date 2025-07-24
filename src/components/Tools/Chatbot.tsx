import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";

interface ChatbotPageProps {
  projectId: string;
}

export default function ChatbotPage({ projectId }: ChatbotPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatbot = async () => {
      try {
        setLoading(true);
      } catch (err) {
        setError("Failed to load chatbot");
      } finally {
        setLoading(false);
      }
    };
    loadChatbot();
  }, [projectId]);

  if (loading) return <div>Loading chatbot...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ComponentCard title="Chatbot">
      <div className="text-gray-500 dark:text-gray-400">
        Chatbot interface or configuration settings
      </div>
    </ComponentCard>
  );
}