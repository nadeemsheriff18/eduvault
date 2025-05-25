import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) navigate('/dashboard');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/dashboard');
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  };

  const handleSignup = async () => {
    setMessage('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      const user = data?.user;
      if (user) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            name,
            email,
          },
        ]);
        if (insertError) {
          setMessage('Signup succeeded, but storing name failed.');
        } else {
          setMessage('Signup successful. Please check your email to confirm.');
        }
      }
    }
  };

  const handleResetPassword = async () => {
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage(error.message);
    else setMessage('Password reset email sent. Check your inbox.');
  };

  const renderForm = () => (
    <>
      {authMode === 'signup' && (
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-4"
      />
      {authMode !== 'forgot' && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
      )}
      {message && <p className="text-red-600 mb-2 text-sm">{message}</p>}

      <button
        onClick={
          authMode === 'login'
            ? handleLogin
            : authMode === 'signup'
            ? handleSignup
            : handleResetPassword
        }
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
      >
        {authMode === 'login'
          ? 'Login'
          : authMode === 'signup'
          ? 'Sign Up'
          : 'Reset Password'}
      </button>

      {authMode === 'login' && (
        <p
          className="text-sm text-blue-600 mt-2 cursor-pointer"
          onClick={() => setAuthMode('forgot')}
        >
          Forgot password?
        </p>
      )}
    </>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center space-y-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700">EduVault</h1>
        <p className="text-gray-600">
          {authMode === 'login'
            ? 'Login to your study vault.'
            : authMode === 'signup'
            ? 'Create an EduVault account.'
            : 'Reset your password'}
        </p>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setAuthMode('login')}
            className={`px-4 py-2 rounded ${
              authMode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`px-4 py-2 rounded ${
              authMode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {renderForm()}
      </div>
    </div>
  );
};

export default Login;
