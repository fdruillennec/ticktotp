import React, { useState } from 'react';
const apiURL = import.meta.env.VITE_API_URL;

export function GenerateSecret() {
  const [email, setEmail] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');

  const generate = async () => {
    try {
      const res = await fetch(`${apiURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }

      const data = await res.json();
      setQrUrl(data.qrcode_base64);
      setSecret(data.secret);        // Set the secret for debug purposes
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
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
      <button onClick={generate} className="px-4 py-2 bg-blue-500 text-white rounded">
        Generate TOTP Secret
      </button>
      {qrUrl && (
        <>
          <h3 className="mt-4 font-bold">Scan this QR code:</h3>
          <img src={qrUrl} alt="TOTP QR" className="mt-2" />
          <p className="text-sm text-gray-500 mt-2">Secret: {secret}</p>
        </>
      )}
    </div>
  );
}
