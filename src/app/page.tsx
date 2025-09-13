'use client';

import { useState } from 'react';
// getSession is added to check the user's role after login
import { signIn, getSession } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';
import { Input } from './components/ui/inputs';
import { Button } from './components/ui/buttons';
import "./globals.css";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // --- THIS FUNCTION IS THE ONLY PART THAT HAS BEEN UPDATED ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous error messages

    try {
      // Use the signIn function from NextAuth.js
      const result = await signIn('credentials', {
        redirect: false, // Tell NextAuth not to redirect automatically
        email,
        password,
      });

      if (result?.error) {
        // If NextAuth returns an error, display it
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        // If login is successful, fetch the session to check the role
        const session = await getSession();

        if (session?.user?.role === 'ADMIN') {
          // If user is an ADMIN, redirect to the admin page
          router.push('/admin');
        } else {
          // If user is not an ADMIN, redirect to the regular dashboard
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="two-column-card">
        {/* Left Column for Introduction */}
        <div className="left-column">
          <h2>Welcome to CT-Cloud computing</h2>
          <img src="/mitlogo.png" alt='Illustration' />
          <p>
            Sign in to access your personalized dashboard and start managing your projects.
          </p>
        </div>

        {/* Right Column for Login Form */}
        <div className="right-column">
          <form onSubmit={handleLogin} className="auth-form">
            <h1>Login</h1>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <Button type="submit" className="primary-button">Login</Button>
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}