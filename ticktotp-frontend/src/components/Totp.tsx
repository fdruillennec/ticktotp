import React, { useState } from 'react';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const res = await axios.post(`${baseURL}/totp/generate`, { email });


const Totp = () => {
  const [email, setEmail] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);

  const generate = async () => {
    const res = await axios.post('http://localhost:3000/generate', { email });
    setQrCode(res.data.qrcode_base64);
    setValid(null);
  };

  const verify = async () => {
    const res = await axios.post('http://localhost:3000/verify', { email, token });
    setValid(res.data.valid);
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl space-y-4">
      <h2 className="text-xl font-bold">TOTP Generator</h2>
      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" onClick={generate}>
        Generate QR Code
      </button>
      {qrCode && (
        <div className="flex justify-center">
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
      <input
        className="w-full border p-2 rounded"
        placeholder="TOTP Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={verify}>
        Verify Token
      </button>
      {valid !== null && (
        <div className={`text-center font-bold ${valid ? 'text-green-600' : 'text-red-600'}`}>
          {valid ? 'Token is valid ✅' : 'Invalid token ❌'}
        </div>
      )}
    </div>
  );
};

export default Totp;
