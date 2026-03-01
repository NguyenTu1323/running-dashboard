import { useState } from 'react';
import { SITE_PASSWORD } from '../config';

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('authenticated') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem('authenticated', 'true');
      setAuthenticated(true);
    } else {
      setError('Incorrect password');
    }
  };

  if (authenticated) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Running Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
          Enter password to continue
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
