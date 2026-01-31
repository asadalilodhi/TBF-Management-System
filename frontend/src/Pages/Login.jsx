// frontend/src/Login.jsx
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(''); // To show Success/Fail messages

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('Checking...');

    try {
      // Connect to the Backend Container
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      // If successful:
      setStatus(`Success! Welcome ${res.data.role}`);
      console.log('Your Digital Token:', res.data.token);
      
      // Save token (normally we'd redirect here)
      localStorage.setItem('token', res.data.token);

    } catch (err) {
      // If failed:
      setStatus('Login Failed: ' + (err.response?.data?.error || 'Server Error'));
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>TBF Staff Portal</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#D32F2F', color: 'white', border: 'none' }}>
          Secure Login
        </button>
      </form>
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
}

export default Login;