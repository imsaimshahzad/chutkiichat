import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background liquid-bg">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flash-gradient flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="mb-2 text-5xl font-bold flash-text">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">This page vanished faster than your messages!</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl flash-button font-semibold transition-all hover:scale-105"
        >
          <Zap className="w-4 h-4" />
          Back to FlashChat
        </a>
      </div>
    </div>
  );
};

export default NotFound;
