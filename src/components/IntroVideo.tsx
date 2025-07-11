import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Volume2, VolumeX } from 'lucide-react';
import introVideo from '../assets/videos/intro.mp4';

const IntroVideo: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVisited, setHasVisited] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // First check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      
      if (user) {
        // User is authenticated, go to dashboard
        navigate('/dashboard');
        return;
      }
      
      // User is not authenticated, check visit status
      checkVisitStatus();
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkVisitStatus = async () => {
    try {
      const visitRef = ref(database, 'userVisits/hasVisited');
      const snapshot = await get(visitRef);
      
      if (snapshot.exists()) {
        // User has visited before, redirect to auth
        navigate('/auth');
      } else {
        // First visit, show video
        setHasVisited(false);
      }
    } catch (error) {
      console.error('Error checking visit status:', error);
      // If there's an error, show video anyway
      setHasVisited(false);
    }
  };

  const handleVideoEnd = async () => {
    await markAsVisited();
    navigate('/auth');
  };

  const handleSkip = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    await markAsVisited();
    navigate('/auth');
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const markAsVisited = async () => {
    try {
      const visitRef = ref(database, 'userVisits/hasVisited');
      await set(visitRef, true);
    } catch (error) {
      console.error('Error marking as visited:', error);
    }
  };

  // Show loading while checking auth/visit status
  if (isAuthenticated === null || hasVisited === null) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Don't show video if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  // Don't show video if user has visited before
  if (hasVisited) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        onEnded={handleVideoEnd}
        playsInline
      >
        <source src={introVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute bottom-8 right-8 flex gap-3">
        <button
          onClick={handleToggleMute}
          className="bg-black bg-opacity-50 text-white p-3 rounded-lg hover:bg-opacity-70 transition-all duration-200"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button
          onClick={handleSkip}
          className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg hover:bg-opacity-70 transition-all duration-200 font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default IntroVideo; 