import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatRoom from "@/components/ChatRoom";
import { sessionExists, generateAnonymousName } from "@/lib/chatUtils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Room = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initRoom = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      // Check for stored username in sessionStorage (for page refreshes)
      const storedUser = sessionStorage.getItem(`room-${id}-user`);
      
      if (storedUser) {
        setUserName(storedUser);
        setIsLoading(false);
        return;
      }

      // Check if session exists
      const exists = await sessionExists(id);
      
      if (!exists) {
        setError("Session not found");
        toast.error("Session not found. Redirecting...");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      // Generate anonymous name and store it
      const newUserName = generateAnonymousName();
      sessionStorage.setItem(`room-${id}-user`, newUserName);
      setUserName(newUserName);
      setIsLoading(false);
      
      console.log('Joined room:', id, 'as:', newUserName);
    };

    initRoom();
  }, [id, navigate]);

  const handleLeave = () => {
    if (id) {
      sessionStorage.removeItem(`room-${id}-user`);
    }
    navigate("/");
  };

  if (isLoading || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          {error ? (
            <>
              <p className="text-destructive text-lg">{error}</p>
              <p className="text-muted-foreground">Redirecting to home...</p>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Joining room...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!id || !userName) {
    return null;
  }

  return (
    <ChatRoom
      sessionCode={id}
      userName={userName}
      onLeave={handleLeave}
    />
  );
};

export default Room;
