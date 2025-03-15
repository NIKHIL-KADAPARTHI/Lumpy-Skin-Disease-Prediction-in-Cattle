import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Cloud, Database, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedText from '../components/AnimatedText';

const Landing: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const iconAnimation = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.2,
      rotate: 15,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#020617] text-white pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden subtle-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-10 pb-8 sm:pt-16 sm:pb-14 lg:pt-24 lg:pb-20">
            <div className="text-center">
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <AnimatedText
                  text="FarmFriend"
                  className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-blue-500"
                  type="heading"
                />
                <AnimatedText
                  text="Empowering Livestock Health"
                  className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mt-2"
                  type="heading"
                  delay={0.3}
                />
              </motion.div>

              <motion.p
                className="mt-6 max-w-lg mx-auto text-xl text-gray-300 sm:max-w-3xl"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                Advanced monitoring and early detection of Lumpy Skin Disease (LSD) in cattle using AI-powered image analysis and weather data.
              </motion.p>

              <motion.div
                className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-3 sm:gap-5">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 sm:px-8"
                    >
                      Get Started
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-gray-50 sm:px-8"
                    >
                      Sign Up
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 border border-blue-500 text-base font-medium rounded-md shadow-sm text-blue-500 hover:bg-blue-900/20 sm:px-8"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      Documentation
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
          <motion.div
            className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-blue-500/10"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-[40%] right-[10%] w-96 h-96 rounded-full bg-blue-700/10"
            animate={{
              x: [0, -70, 0],
              y: [0, 50, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[20%] w-80 h-80 rounded-full bg-indigo-600/10"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 18,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <motion.h2
              className="text-base text-blue-500 font-semibold tracking-wide uppercase"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Features
            </motion.h2>

            <motion.p
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Comprehensive Cattle Health Monitoring
            </motion.p>

            <motion.p
              className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our platform provides a complete solution for monitoring and managing cattle health with a focus on early LSD detection.
            </motion.p>
          </div>

          <motion.div
            className="mt-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <motion.div
                className="flex"
                variants={featureVariants}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white shimmer"
                    variants={iconAnimation}
                    whileHover="hover"
                  >
                    <Activity className="h-6 w-6" />
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">AI-Powered Image Analysis</h3>
                  <p className="mt-2 text-base text-gray-300">
                    Upload images of your cattle for instant AI analysis to detect early signs of Lumpy Skin Disease.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex"
                variants={featureVariants}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white shimmer"
                    variants={iconAnimation}
                    whileHover="hover"
                  >
                    <Cloud className="h-6 w-6" />
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Weather Risk Assessment</h3>
                  <p className="mt-2 text-base text-gray-300">
                    Integrates local weather data to assess environmental risk factors for disease spread.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex"
                variants={featureVariants}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white shimmer"
                    variants={iconAnimation}
                    whileHover="hover"
                  >
                    <Database className="h-6 w-6" />
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Comprehensive Health Records</h3>
                  <p className="mt-2 text-base text-gray-300">
                    Maintain detailed health records for each animal with historical assessment data.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex"
                variants={featureVariants}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white shimmer"
                    variants={iconAnimation}
                    whileHover="hover"
                  >
                    <Shield className="h-6 w-6" />
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">RT-PCR Result Integration</h3>
                  <p className="mt-2 text-base text-gray-300">
                    Record and track laboratory test results alongside visual assessments for complete health monitoring.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="py-16 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base text-blue-500 font-semibold tracking-wide uppercase">
              Documentation
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Learn More About Our Technology
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
              Explore our comprehensive documentation to understand how our AI-powered system works to detect and prevent Lumpy Skin Disease.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.a
              href="https://github.com/NIKHIL-KADAPARTHI/Lumpy-Skin-Disease-Prediction-in-Cattle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-4 border border-blue-500 text-base font-medium rounded-md shadow-md text-blue-500 bg-transparent hover:bg-blue-900/20 transition-colors"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-6 w-6 mr-2" />
              <span>View Documentation on GitHub</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Landing;