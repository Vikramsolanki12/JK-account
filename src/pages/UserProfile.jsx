// pages/UserProfile.jsx

import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./UserProfile.css";

export default function UserProfile({ user, role }) {
  const { id } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  /* ================= FETCH USER INFO ================= */

  const fetchUser = async () => {
    const snapshot = await getDoc(doc(db, "users", id));
    if (snapshot.exists()) {
      setUserData(snapshot.data());
    }
  };

  /* ================= FETCH TRANSACTIONS ================= */

  const fetchTransactions = async () => {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", id)
    );

    const snapshot = await getDocs(q);

    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If logged in as normal user → only see own transactions
    if (role === "user") {
      data = data.filter(
        (t) => t.ownerEmail === user.email
      );
    }

    setTransactions(data);
  };

  /* ================= DELETE TRANSACTION ================= */

  const deleteTransaction = async (transactionId, ownerEmail) => {
    // Only owner or transaction creator can delete
    if (
      role === "owner" ||
      ownerEmail === user.email
    ) {
      await deleteDoc(doc(db, "transactions", transactionId));
      fetchTransactions();
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
      fetchTransactions();
    }
  }, [user, role]);

  /* ================= SUMMARY ================= */

  const totalSent = transactions
    .filter((t) => t.type === "sent")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === "received")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalReceived - totalSent;

  return (
    <div className="profile-container">

      <Link to="/" className="back-btn">
        ← Back to Home
      </Link>

      <h2 className="profile-title">
        {userData?.name || "User"} Transactions
      </h2>

      {userData && (
        <p className="user-email-display">
          📧 {userData.email}
        </p>
      )}

      {/* ================= SUMMARY ================= */}
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
          className={`summary-card balance ${
            balance >= 0 ? "positive" : "negative"
          }`}
        >
          <h3>Balance</h3>
          <p>₹{balance}</p>
        </div>

      </div>

      {/* ================= TRANSACTIONS ================= */}
      <div className="card">
        <h3>Transactions</h3>

        {transactions.length === 0 && (
          <p className="empty-text">
            No transactions found
          </p>
        )}

        {transactions.map((t) => (
          <div
            key={t.id}
            className={`transaction-item ${t.type}`}
          >
            <div>
              <strong>₹{t.amount}</strong>
              <p className="transaction-type">
                {t.type.toUpperCase()}
              </p>
              <p>{t.description}</p>
              <p className="transaction-date">
                {t.date?.toDate
                  ? new Date(
                      t.date.toDate()
                    ).toLocaleDateString()
                  : ""}
              </p>
            </div>

            {(role === "owner" ||
              t.ownerEmail === user.email) && (
              <button
                className="delete-btn"
                onClick={() =>
                  deleteTransaction(
                    t.id,
                    t.ownerEmail
                  )
                }
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}