// components/UserCard.jsx

import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "./UserCard.css";

export default function UserCard({
  user,
  transactions,
  ownerId,
  onBack,
}) {
  if (!user) return null;

  const userTransactions = transactions.filter(
    (t) => t.userEmail === user.email
  );

  const totalSent = userTransactions
    .filter((t) => t.type === "sent")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = userTransactions
    .filter((t) => t.type === "received")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalReceived - totalSent;

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  return (
    <div className="user-card-container">
      
      {/* HEADER */}
      <div className="user-card-header">
        <h3>👤 {user.name}</h3>
        <p>{user.email}</p>
      </div>

      {/* SUMMARY */}
      <div className="user-summary-grid">
        
        <div className="user-summary-card sent">
          <h4>Sent</h4>
          <p>₹{totalSent}</p>
        </div>

        <div className="user-summary-card received">
          <h4>Received</h4>
          <p>₹{totalReceived}</p>
        </div>

        <div
          className={`user-summary-card ${
            balance >= 0
              ? "balance-positive"
              : "balance-negative"
          }`}
        >
          <h4>Balance</h4>
          <p>₹{Math.abs(balance)}</p>
        </div>

      </div>

      {/* TRANSACTIONS */}
      <div className="user-transactions">
        <h4>Transactions</h4>

        {userTransactions.length === 0 && (
          <p>No transactions yet</p>
        )}

        {userTransactions.map((t) => (
          <div
            key={t.id}
            className="user-transaction-item"
          >
            <div className="user-transaction-left">
              <p>{t.description}</p>
              <small>
                {t.date?.toDate
                  ? new Date(
                      t.date.toDate()
                    ).toLocaleDateString()
                  : ""}
              </small>
            </div>

            <div className="user-transaction-right">
              <span
                className={`user-amount ${
                  t.type === "sent"
                    ? "sent"
                    : "received"
                }`}
              >
                ₹{t.amount}
              </span>

              {t.ownerId === ownerId && (
                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteTransaction(t.id)
                  }
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      {onBack && (
        <button
          className="user-back-btn"
          onClick={onBack}
        >
          ← Back to All Users
        </button>
      )}
    </div>
  );
}