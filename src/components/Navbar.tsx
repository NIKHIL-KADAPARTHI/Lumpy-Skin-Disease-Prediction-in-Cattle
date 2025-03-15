import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Database, Activity, Github, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinkVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-300 ${isScrolled ? 'bg-[#0f172a]/95 backdrop-blur-sm shadow-lg' : 'bg-[#0f172a]'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <motion.div
            className="flex items-center"
            variants={logoVariants}
            initial="initial"
            animate="animate"
          >
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="shimmer"
              >
                <Activity className="h-8 w-8 text-blue-500" />
              </motion.div>
              <span className="text-xl font-bold">FarmFriend</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <motion.div
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-3 py-2 rounded ${isActive('/dashboard') ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-blue-900/30'
                      }`}
                  >
                    <Home className="h-5 w-5 mr-1" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>

                <motion.div
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to="/cattle-info"
                    className={`flex items-center px-3 py-2 rounded ${isActive('/cattle-info') ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-blue-900/30'
                      }`}
                  >
                    <Database className="h-5 w-5 mr-1" />
                    <span>Cattle Info</span>
                  </Link>
                </motion.div>

                <motion.div
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to="/rt-pcr"
                    className={`flex items-center px-3 py-2 rounded ${isActive('/rt-pcr') ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-blue-900/30'
                      }`}
                  >
                    <Activity className="h-5 w-5 mr-1" />
                    <span>RT-PCR</span>
                  </Link>
                </motion.div>

                <motion.div
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to="/profile"
                    className={`flex items-center px-3 py-2 rounded ${isActive('/profile') ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-blue-900/30'
                      }`}
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Profile</span>
                  </Link>
                </motion.div>

                <motion.a
                  href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 rounded hover:bg-blue-900/30"
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Github className="h-5 w-5 mr-1" />
                  <span>Docs</span>
                </motion.a>

                <motion.button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded bg-red-600 hover:bg-red-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span>Sign Out</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.a
                  href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 rounded hover:bg-blue-900/30"
                  variants={navLinkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Github className="h-5 w-5 mr-1" />
                  <span>Documentation</span>
                </motion.a>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="flex items-center px-3 py-2 rounded bg-blue-600 hover:bg-blue-700">
                    <span>Login</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-[#0f172a] border-t border-blue-900/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded ${isActive('/dashboard') ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-blue-900/30'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <Link
                  to="/cattle-info"
                  className={`block px-3 py-2 rounded ${isActive('/cattle-info') ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-blue-900/30'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    <span>Cattle Info</span>
                  </div>
                </Link>

                <Link
                  to="/rt-pcr"
                  className={`block px-3 py-2 rounded ${isActive('/rt-pcr') ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-blue-900/30'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    <span>RT-PCR</span>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded ${isActive('/profile') ? 'bg-blue-900/50 text-blue-400' : 'text-gray-300 hover:bg-blue-900/30'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>Profile</span>
                  </div>
                </Link>

                <a
                  href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded text-gray-300 hover:bg-blue-900/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Github className="h-5 w-5 mr-2" />
                    <span>Documentation</span>
                  </div>
                </a>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Sign Out</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <a
                  href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded text-gray-300 hover:bg-blue-900/30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Github className="h-5 w-5 mr-2" />
                    <span>Documentation</span>
                  </div>
                </a>

                <Link
                  to="/login"
                  className="block px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;