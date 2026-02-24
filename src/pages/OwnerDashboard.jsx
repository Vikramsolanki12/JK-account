// pages/OwnerDashboard.jsx

import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import UserCard from "../components/UserCard";
import "./Home.css";

export default function OwnerDashboard({ user }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("sent");

  const [selectedUser, setSelectedUser] = useState(null);

  const dropdownRef = useRef(null);

  /* ================= REAL-TIME USERS ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= REAL-TIME TRANSACTIONS ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => {
        const d1 = a.date?.toDate?.() || 0;
        const d2 = b.date?.toDate?.() || 0;
        return d2 - d1;
      });

      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= SUMMARY ================= */

  const totalSent = transactions
    .filter((t) => t.type === "sent")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalReceived = transactions
    .filter((t) => t.type === "received")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalReceived - totalSent;

  /* ================= ADD USER ================= */

  const addUser = async () => {
    if (!name.trim() || !email.trim()) return;

    const normalizedEmail = email.trim().toLowerCase();

    const duplicateQuery = query(
      collection(db, "users"),
      where("ownerId", "==", user.uid),
      where("email", "==", normalizedEmail)
    );

    const duplicateSnap = await getDocs(duplicateQuery);

    if (!duplicateSnap.empty) {
      alert("Email already exists under your account.");
      return;
    }

    await addDoc(collection(db, "users"), {
      name: name.trim(),
      email: normalizedEmail,
      ownerId: user.uid,
      ownerName: user.displayName,
      createdAt: new Date(),
    });

    setName("");
    setEmail("");
  };

  /* ================= DELETE USER ================= */

  const deleteUser = async (id, userEmail) => {
    const normalizedEmail = userEmail.trim().toLowerCase();

    await deleteDoc(doc(db, "users", id));

    const q = query(
      collection(db, "transactions"),
      where("ownerId", "==", user.uid),
      where("userEmail", "==", normalizedEmail)
    );

    const snapshot = await getDocs(q);

    await Promise.all(
      snapshot.docs.map((t) =>
        deleteDoc(doc(db, "transactions", t.id))
      )
    );
  };

  /* ================= ADD TRANSACTION ================= */

  const toggleUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const addTransaction = async () => {
    if (!amount || !description.trim() || selectedUsers.length === 0) {
      alert("Fill all fields");
      return;
    }

    const total = Number(amount);
    const divided = type === "sent" ? total / selectedUsers.length : total;

    await Promise.all(
      selectedUsers.map(async (userId) => {
        const selectedUserObj = users.find((u) => u.id === userId);

        return addDoc(collection(db, "transactions"), {
          ownerId: user.uid,
          ownerName: user.displayName,
          userEmail: selectedUserObj.email.trim().toLowerCase(), // 🔥 FIXED
          userName: selectedUserObj.name,
          amount:
            type === "sent"
              ? Number(divided.toFixed(2))
              : total,
          description: description.trim(),
          type,
          date: new Date(),
        });
      })
    );

    setAmount("");
    setDescription("");
    setSelectedUsers([]);
    setDropdownOpen(false);
  };

  /* ================= UI ================= */

  return (
    <div className="home-container">
      <h2>👑 Owner Dashboard</h2>

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
          <h3>Total Available</h3>
          <p>₹{Math.abs(balance)}</p>
        </div>
      </div>

      {selectedUser ? (
        <UserCard
          user={selectedUser}
          transactions={transactions}
          ownerId={user.uid}
          onBack={() => setSelectedUser(null)}
        />
      ) : (
        <>
          {/* ADD USER */}
          <div className="card">
            <h3>➕ Add Person</h3>
            <div className="input-group">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
              />
              <button onClick={addUser}>Add</button>
            </div>
          </div>

          {/* ADD TRANSACTION */}
          <div className="card">
            <h3>💸 Add Transaction</h3>

            <div className="dropdown" ref={dropdownRef}>
              <div
                className="dropdown-header"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedUsers.length === 0
                  ? "Select Users"
                  : `${selectedUsers.length} Selected`}
              </div>

              {dropdownOpen && (
                <div className="dropdown-list">
                  <div className="dropdown-item" onClick={selectAllUsers}>
                    👥 All Users
                  </div>

                  {users.map((u) => (
                    <div
                      key={u.id}
                      className={`dropdown-item ${
                        selectedUsers.includes(u.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleUser(u.id)}
                    >
                      👤 {u.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <input
                type="number"
                placeholder="Total Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="sent">Spend</option>
                <option value="received">Received</option>
              </select>

              <button onClick={addTransaction}>Add</button>
            </div>
          </div>

          {/* USER LIST */}
          <div className="card">
            <h3>👥 My Users</h3>

            {users.map((u) => (
              <div key={u.id} className="user-card">
                <div>👤 {u.name}</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setSelectedUser(u)}>View</button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(u.id, u.email)}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}