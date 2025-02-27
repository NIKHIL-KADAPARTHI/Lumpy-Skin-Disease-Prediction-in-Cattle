import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, logout, resetPassword } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      if (currentUser?.email) {
        await resetPassword(currentUser.email);
        setMessage('Password reset email sent! Check your inbox.');
      } else {
        setError('No email associated with this account');
      }
    } catch (error) {
      setError('Failed to send password reset email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <User className="h-8 w-8 text-blue-500 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
          </div>
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 my-2" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 my-2" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="border-t border-gray-700">
            <dl>
              <div className="bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">Email address</dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{currentUser?.email}</dd>
              </div>
              <div className="bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">User ID</dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{currentUser?.uid}</dd>
              </div>
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6 space-y-4">
            <div>
              <h4 className="text-md font-medium text-white">Password Management</h4>
              <p className="mt-1 text-sm text-gray-400">
                You can reset your password by clicking the button below. A password reset link will be sent to your email address.
              </p>
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;