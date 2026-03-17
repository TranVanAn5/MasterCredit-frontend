import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CardsPage     from "./pages/CardsPage";
import CardCatalogPage from "./pages/CardCatalogPage";
import PublicCardsPage from "./pages/PublicCardsPage";
import CardComparePage from "./pages/CardComparePage";
import CardDetailPage from "./pages/CardDetailPage";
import CardApplicationPage from "./pages/CardApplicationPage";
import ChatPage from "./pages/ChatPage";

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <CardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse-cards"
            element={<PublicCardsPage />}
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <CardCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare-cards"
            element={
              <ProtectedRoute>
                <CardComparePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/card-detail/:id"
            element={<CardDetailPage />}
          />
          <Route
            path="/apply-card/:cardTypeId"
            element={
              <ProtectedRoute>
                <CardApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
