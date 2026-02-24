// pages/Home.jsx

import OwnerDashboard from "./OwnerDashboard";
import UserDashboard from "./UserDashboard";

export default function Home({ user, role }) {
  if (!role) return <p>Select your role</p>;

  if (role === "owner") {
    return <OwnerDashboard user={user} />;
  }

  if (role === "user") {
    return <UserDashboard user={user} />;
  }

  return null;
}