import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatRoom from "@/components/ChatRoom";
import { sessionExists, generateAnonymousName } from "@/lib/chatUtils";
import { toast } from "sonner";
import { MessageCircle, Zap } from "lucide-react";

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

      const storedUser = sessionStorage.getItem(`room-${id}-user`);
      
      if (storedUser) {
        setUserName(storedUser);
        setIsLoading(false);
        return;
      }

      const exists = await sessionExists(id);
      
      if (!exists) {
        setError("Room not found");
        toast.error("This Chutki room doesn't exist. Redirecting...");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          {error ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-destructive text-lg font-medium">{error}</p>
              <p className="text-muted-foreground">Redirecting to home...</p>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-10 h-10 text-white" />
                  <Zap className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-sparkle" />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-muted-foreground font-medium">Joining Chutki room...</p>
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
