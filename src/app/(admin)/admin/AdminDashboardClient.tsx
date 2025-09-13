'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Admin.module.css';
import UserRow from './_components/UserRow';

// Define the User type for clarity
interface User {
  id: string;
  email: string | null;
  role: string;
}

export default function AdminDashboardClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newUserEmail, password: newUserPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`Success: User ${data.email} created.`);
      setNewUserEmail('');
      setNewUserPassword('');
      router.refresh(); // Automatically refresh the user list
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => router.push('/dashboard')} className={styles.button}>
          Go to User Dashboard
        </button>
      </header>
      
      <main className={styles.mainContent}>
        <section className={styles.card}>
          <h2>Add New User</h2>
          <form onSubmit={handleCreateUser} className={styles.form}>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="New User Email"
              required
              className={styles.input}
            />
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="New User Password"
              required
              minLength={6}
              className={styles.input}
            />
            <button type="submit" className={`${styles.button} ${styles.primary}`}>Create User</button>
          </form>
          {message && <p className={styles.message}>{message}</p>}
        </section>

        <section className={styles.card}>
          <h2>User Management</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}