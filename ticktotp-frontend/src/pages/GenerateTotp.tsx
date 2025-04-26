import React, { useEffect, useState } from 'react';

interface TotpResponse {
  secret: string;
  otpauth_url: string;
  qrcode_base64: string;
}

const GenerateTotp = ({ email }: { email: string }) => {
  const [totpData, setTotpData] = useState<TotpResponse | null>(null);

  useEffect(() => {
    const fetchTotp = async () => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setTotpData(data);
      }
    };

    fetchTotp();
  }, [email]);

  if (!totpData) return <p className="text-center mt-8">Generating QR Code...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Scan this QR code</h2>
        <p className="text-slate-600 mb-2">Open your authenticator app and scan the code below.</p>
        <img src={totpData.qrcode_base64} alt="TOTP QR Code" className="mx-auto my-4" />
        <p className="text-xs text-slate-400 break-all">
          If you can't scan, use this secret manually: <br />
          <span className="font-mono">{totpData.secret}</span>
        </p>
      </div>
    </div>
  );
};

export default GenerateTotp;
