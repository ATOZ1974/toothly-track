import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // 404 tracking could be handled by analytics service in production

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-[var(--shadow-soft)]"
        >
          Return to Dental Management
        </a>
      </div>
    </div>
  );
};

export default NotFound;
