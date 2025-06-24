import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { User } from 'firebase/auth';
import PageWrapper from './PageWrapper';
import { Camera, Upload } from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Set a default profile image or get from user's photoURL
        setProfileImage(user.photoURL || 'https://via.placeholder.com/800x1200');
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageWrapper title="Admin Profile">
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]" style={{

      }}>
        <div className="w-[800px] h-[900px] bg-white/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/20 overflow-hidden">
          <div className="px-8 py-8 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-1500 mb-2">Personal Information</h2>
              <p className="text-slate-600">Your account details and preferences</p>
            </div> 

            <div className="flex-grow">
              <div className="space-y-6">
                <div className="bg-slate-50/50 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Account Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                      <p className="text-slate-800 bg-white/50 backdrop-blur-sm rounded-md px-4 py-2 border border-gray-200/20">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Account ID</label>
                      <p className="text-slate-800 bg-white/50 backdrop-blur-sm rounded-md px-4 py-2 border border-gray-200/20">
                        {user.uid}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Account Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Email Verification</label>
                      <div className="bg-white/50 backdrop-blur-sm rounded-md px-4 py-2 border border-gray-200/20">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                          user.emailVerified
                            ? 'bg-green-100/80 text-green-800'
                            : 'bg-yellow-100/80 text-yellow-800'
                        }`}>
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Last Sign In</label>
                      <p className="text-slate-800 bg-white/50 backdrop-blur-sm rounded-md px-4 py-2 border border-gray-200/20">
                        {user.metadata.lastSignInTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200/30">
              <button
                onClick={handleSignOut}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage; 