import React, { useState } from 'react';
const apiURL = import.meta.env.VITE_API_URL;

export function VerifyToken() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const verify = async () => {
    try {
      const res = await fetch(`${apiURL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (res.status === 404) {
        setMessage('Email not found');
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setMessage('Invalid token or email');
        return;
      }

      setMessage('Token successfully verified!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow mb-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="p-2 border rounded mb-4 w-full"
        required
      />
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your TOTP token"
        className="p-2 border rounded mb-4 w-full"
        required
      />
      <button onClick={verify} className="px-4 py-2 bg-blue-500 text-white rounded">
        Verify Token
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
