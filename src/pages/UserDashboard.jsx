// pages/UserDashboard.jsx

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Home.css";

export default function UserDashboard({ user }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.email) return;

    const normalizedEmail = user.email.trim().toLowerCase();

    const q = query(
      collection(db, "transactions"),
      where("userEmail", "==", normalizedEmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort latest first safely
      data.sort((a, b) => {
        const d1 = a.date?.toDate?.() || 0;
        const d2 = b.date?.toDate?.() || 0;
        return d2 - d1;
      });

      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= CALCULATIONS ================= */

  const totalSent = transactions
    .filter((t) => t.type === "sent")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalReceived = transactions
    .filter((t) => t.type === "received")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalReceived - totalSent;
  const absoluteBalance = Math.abs(balance);

  /* ================= UI ================= */

  return (
    <div className="home-container">
      <h2>👤 User Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card sent">
          <h3>Total Sent</h3>
          <p>₹{totalSent}</p>
        </div>

        <div className="summary-card received">
          <h3>Total Received</h3>
          <p>₹{totalReceived}</p>
        </div>

        <div
          className="summary-card"
          style={{
            background:
              balance >= 0
                ? "linear-gradient(135deg,#4caf50,#2e7d32)"
                : "linear-gradient(135deg,#ef5350,#c62828)",
          }}
        >
          <h3>Balance</h3>
          <p>₹{absoluteBalance}</p>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="card">
        <h3>💸 My Transactions</h3>

        {transactions.length === 0 && (
          <p className="empty-text">
            No transactions found.
          </p>
        )}

        {transactions.map((t) => (
          <div
            key={t.id}
            className="transaction-item"
            style={{
              borderLeft:
                t.type === "received"
                  ? "6px solid #4caf50"
                  : "6px solid #ef5350",
            }}
          >
            <div>
              <strong>👑 {t.ownerName}</strong>
              <p style={{ margin: "4px 0" }}>
                {t.description}
              </p>
              <small>
                {t.date?.toDate
                  ? new Date(
                      t.date.toDate()
                    ).toLocaleDateString()
                  : ""}
              </small>
            </div>

            <div
              style={{
                color:
                  t.type === "received"
                    ? "#2e7d32"
                    : "#c62828",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              ₹{t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}