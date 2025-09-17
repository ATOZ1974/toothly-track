import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // 404 tracking could be handled by analytics service in production

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="glass-card rounded-2xl p-8 text-center space-y-6 animate-scale-in">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 glass-button rounded-lg hover:glass-button transition-all"
        >
          Return to Dental Management
        </a>
      </div>
    </div>
  );
};

export default NotFound;
