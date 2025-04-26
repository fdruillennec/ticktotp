import React, { useState } from 'react';

const VerifyTotp = ({ email }: { email: string }) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });

    if (res.status === 404) {
      setStatus('invalid');
    } else {
      const data = await res.json();
      setStatus(data.valid ? 'valid' : 'invalid');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Enter your code</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Verify Token
          </button>
        </form>
        {status === 'valid' && <p className="mt-4 text-green-600 font-semibold">✅ Token valid!</p>}
        {status === 'invalid' && <p className="mt-4 text-red-600 font-semibold">❌ Invalid token or email</p>}
      </div>
    </div>
  );
};

export default VerifyTotp;
