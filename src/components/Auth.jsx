// components/Auth.jsx

import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import "./Auth.css";

export default function Auth({ user }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!selectedRole) {
      alert("Please select Owner or User first");
      return;
    }

    try {
      setLoading(true);

      await signInWithPopup(auth, provider);

      // 🔥 Store selected role temporarily
      localStorage.setItem("jkountRole", selectedRole);

      // Refresh app to apply role
      window.location.reload();

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("jkountRole"); // 🔥 Clear role
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="auth-container">
      {!user ? (
        <div className="auth-card">

          <h3>Select Role</h3>

          <div className="role-selection">
            <button
              className={selectedRole === "owner" ? "active" : ""}
              onClick={() => setSelectedRole("owner")}
            >
              👑 Owner
            </button>

            <button
              className={selectedRole === "user" ? "active" : ""}
              onClick={() => setSelectedRole("user")}
            >
              👤 User
            </button>
          </div>

          <button
            className="google-btn"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

        </div>
      ) : (
        <div className="auth-card">
          <div className="user-box">
            <img
              src={user.photoURL}
              alt="profile"
              className="user-avatar"
            />
            <div>
              <p>{user.displayName}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>
                {user.email}
              </p>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}