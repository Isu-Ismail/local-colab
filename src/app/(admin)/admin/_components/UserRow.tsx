'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from '../Admin.module.css';

interface User {
  id: string;
  email: string | null;
  role: string;
}

interface UserRowProps {
  user: User;
}

export default function UserRow({ user }: UserRowProps) {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState(user.role);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    
    setCurrentRole(newRole);
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete user: ${user.email}? This action cannot be undone.`)) {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    }
  };

  return (
    <tr>
      <td>{user.email}</td>
      <td>
        <select value={currentRole} onChange={handleRoleChange} className={styles.select}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td>
        <button onClick={handleDeleteUser} className={styles.deleteButton}>
          Delete
        </button>
      </td>
    </tr>
  );
}