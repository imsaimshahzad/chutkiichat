import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "./SessionCard";
import { generateAnonymousName, sessionExists } from "@/lib/chatUtils";
import { toast } from "sonner";

const JoinSession = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (num: string) => {
    if (code.length < 4) {
      setCode((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleJoin = async () => {
    const trimmedCode = code.trim();
    
    if (trimmedCode.length !== 4) {
      toast.error("Please enter a 4-digit code");
      return;
    }

    setIsLoading(true);

    const exists = await sessionExists(trimmedCode);
    
    if (!exists) {
      toast.error("Room not found. Check the code and try again.");
      setIsLoading(false);
      return;
    }

    const userName = generateAnonymousName();
    sessionStorage.setItem(`room-${trimmedCode}-user`, userName);
    
    toast.success(`Joining as ${userName}`);
    navigate(`/room/${trimmedCode}`);
  };

  return (
    <SessionCard delay={200}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Join a Chutki Room</h2>
          <p className="text-sm text-muted-foreground">Enter a 4-digit room code</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Code Display */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-16 h-20 flex items-center justify-center rounded-2xl text-3xl font-bold font-mono transition-all duration-200 border-2 ${
                code[i]
                  ? "bg-primary/10 text-primary border-primary shadow-md"
                  : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              {code[i] || ""}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="secondary"
              className="h-14 text-xl font-semibold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleNumberPress(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="secondary"
            className="h-14 text-xl font-semibold rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => setCode("")}
          >
            C
          </Button>
          <Button
            variant="secondary"
            className="h-14 text-xl font-semibold rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => handleNumberPress("0")}
          >
            0
          </Button>
          <Button
            variant="secondary"
            className="h-14 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleDelete}
          >
            <Delete className="w-6 h-6" />
          </Button>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-accent to-primary hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          onClick={handleJoin}
          disabled={code.length !== 4 || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join Chutki
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </SessionCard>
  );
};

export default JoinSession;
