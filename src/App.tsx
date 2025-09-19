import AppRoutes from "./routes/AppRoutes";

// Providers
import { AuthProvider } from "./providers/AuthProvider";
// import { ThemeProvider } from "../providers/ThemeProvider";
import { LoadingProvider } from "./providers/LoadingProvider";
import { CartProvider } from "./providers/CartProvider";
import "./index.css";

import { useContext } from "react";
import { LoadingContext } from "./contexts/LoadingContext";
import LoadingSpinner from "./components/common/LoadingSpinner";


function LoadingOverlay() {
  const ctx = useContext(LoadingContext);
  if (!ctx) return null;
  const { isLoading } = ctx;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40 z-[9999]">
      <LoadingSpinner />
      <p className="mt-4 text-white text-lg font-semibold">Loading...</p>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      {/* //   <ThemeProvider> */}
      <CartProvider>
        <LoadingProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 relative">
            <AppRoutes />
            {/* Spinner global overlay */}
            <LoadingOverlay />
          </div>
        </LoadingProvider>
      </CartProvider>
      {/* //   </ThemeProvider> */}
    </AuthProvider>
  );
}

export default App;
