import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import OwnerDashboard from "./pages/OwnerDashboard";
import UserDashboard from "./pages/UserDashboard";
import About from "./pages/About";
import Auth from "./components/Auth";
import "./App.css";

/* ================= HEADER ================= */

function Header({ user, role }) {
  const location = useLocation();

  const logout = async () => {
    localStorage.removeItem("jkountRole"); // 🔥 clear role
    await signOut(auth);
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="logo">
        <img
          src="../public/logo.png"
          alt="JKount Logo"
          className="logo-img"
          width="60"
          height="60"
        />
        <span className="logo-text">JKount</span>
      </div>

      {user && (
        <nav className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/about">About</NavLink>
        </nav>
      )}

      {/* Hide user info on About page */}
      {user && location.pathname !== "/about" && (
        <div className="user-info-header">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

/* ================= APP CONTENT ================= */

function AppContent() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("jkountRole"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ padding: "30px" }}>Loading...</p>;
  }

  return (
    <>
      <Header user={user} role={role} />

      {user && (
        <div className="welcome-section">
          <h2>Welcome, {user.displayName || user.email?.split("@")[0]} 👋</h2>
          <p className="role-text">Role: {role?.toUpperCase()}</p>
        </div>
      )}

      {!user ? (
        <div className="auth-wrapper">
          <Auth user={user} />
        </div>
      ) : role ? (
        <Routes>
          <Route
            path="/"
            element={
              role === "owner" ? (
                <OwnerDashboard user={user} />
              ) : (
                <UserDashboard user={user} />
              )
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <p style={{ padding: "30px" }}>
          ⚠️ Please logout and select role again.
        </p>
      )}
    </>
  );
}

/* ================= ROOT ================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
