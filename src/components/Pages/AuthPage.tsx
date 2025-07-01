import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import logo from '../../assets/images/logo.png';
import networkBg from '../../assets/images/network-bg.jpg';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative"
      style={{
        backgroundImage: `url(${networkBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0" />
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo and Heading */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full shadow-lg mb-3 border-4 border-white" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            IT Infrastructure Monitoring & Automation
          </h1>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 border border-blue-100 ">
          <h1 className="text-xl font-bold text-blue-900 tracking-wide flex flex-col items-center mb-3" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            Welcome
          </h1>
          <p className="mt-1 text-center text-base text-gray-500 flex flex-col items-center max-w-md mb-3">
            Securely monitor, manage, and automate your IT infrastructure from a single dashboard.
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm bg-slate-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm bg-slate-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border-none rounded-lg shadow-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 transition-all duration-200"
                style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-center text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-200 mt-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 