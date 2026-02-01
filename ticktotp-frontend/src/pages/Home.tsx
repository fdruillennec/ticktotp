import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Home.css';

type Step = 'email' | 'generate' | 'verify';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [token, setToken] = useState<string[]>(new Array(6).fill(''));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    try {
      const res = await fetch(`http://localhost:3000/status?email=${encodeURIComponent(email)}`);
      if (res.status === 404) {
        setStep('generate');
      } else if (res.ok) {
        setStep('verify');
      } else {
        setError('Unexpected error, please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again.');
    }
  };

  const generateQrCode = async () => {
    try {
      const res = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.qrcode_base64) {
          setQrCodeData(json.qrcode_base64);
        } else {
          setError('QR Code generation failed.');
        }
      } else {
        setError('Failed to generate TOTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Error generating TOTP code.');
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const fullToken = token.join('');
      const res = await fetch('http://localhost:3000/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: fullToken }),
      });

      setIsVerifying(false);
      if (res.ok) {
        const json = await res.json();
        if (json.valid) {
          setSuccessMessage(`User connected: ${email}`);
          setError(null);
          setToken(new Array(6).fill(''));
        } else {
          setError('Invalid TOTP code. Please try again.');
          setSuccessMessage(null);
        }
      } else {
        setError('Verification failed. Please try again.');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError('Error verifying TOTP code.');
      setIsVerifying(false);
    }
  };

  const resetProcess = () => {
    setEmail('');
    setStep('email');
    setToken(new Array(6).fill(''));
    setSuccessMessage(null);
    setError(null);
    setQrCodeData(null);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const newToken = [...token];
    newToken[index] = value.slice(0, 1);
    setToken(newToken);

    if (value.length === 1 && index < 5) {
      const nextInput = document.getElementById(`token-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }

    if (index === 5 && value.length === 1) {
      const verifyButton = document.getElementById('verify-button');
      if (verifyButton) (verifyButton as HTMLButtonElement).focus();
    }
  };

  const handleTokenInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && !isVerifying && token.every((digit) => digit !== '')) {
      handleVerify();
    }
    if (e.key === 'Backspace' && token[index] === '' && index > 0) {
      const prevInput = document.getElementById(`token-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleVerifyKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' && !isVerifying && token.every((digit) => digit !== '')) {
      handleVerify();
    }
  };

  useEffect(() => {
    if (step === 'verify') {
      const firstInput = document.getElementById('token-0');
      if (firstInput) (firstInput as HTMLInputElement).focus();
    }
  }, [step]);

  return (
    <div className="home-container">
      <h1 className="title">TickTotp App</h1>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {step === 'email' && (
          <motion.div className="form" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                setSuccessMessage(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && isValidEmail(email) && handleLogin()}
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogin} disabled={!isValidEmail(email)}>
              Login with TickTotp
            </motion.button>
            {error && <motion.p className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
          </motion.div>
        )}

        {step === 'generate' && (
          <motion.div className="form" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <p>Email not registered.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateQrCode}>
              Connect an Authenticator App
            </motion.button>
            {qrCodeData ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p>Use the app to to scan this QR code</p>
                <img src={qrCodeData} alt="QR Code" />
              </motion.div>
            ) : null}
            <button className="back-button" onClick={resetProcess}>← Back to Home</button>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div className="form" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            {successMessage ? (
              <motion.p className="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                {successMessage}
              </motion.p>
            ) : (
              <>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  Enter your TOTP code:
                </motion.p>
                <motion.div className="token-input" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  {token.map((digit, index) => (
                    <input
                      key={index}
                      id={`token-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleTokenChange(e, index)}
                      onKeyDown={(e) => handleTokenInputKeyDown(e, index)}
                      maxLength={1}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  ))}
                </motion.div>
                <motion.button
                  id="verify-button"
                  onClick={handleVerify}
                  onKeyDown={handleVerifyKeyPress}
                  disabled={token.some((digit) => digit === '') || isVerifying}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </motion.button>
                {error && (
                  <motion.p className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    {error}
                  </motion.p>
                )}
              </>
            )}
            <button className="back-button" onClick={resetProcess}>← Back to Home</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
