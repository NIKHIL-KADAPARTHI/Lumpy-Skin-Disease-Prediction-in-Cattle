import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ref, push } from 'firebase/database';
import { database } from '../firebase';
import { WeatherData } from '../types';
import { Upload, MapPin, ThermometerSun, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedContainer from '../components/AnimatedContainer';
import { predictAssessment, PredictResponse } from '../api';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // New state for annotated image from API response
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);

  // Location and weather state
  const [address, setAddress] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);

  // Cattle health form state
  const [cattleId, setCattleId] = useState('');
  const [bodyTemp, setBodyTemp] = useState(38.5);
  const [skinLesions, setSkinLesions] = useState('No');
  const [lossOfAppetite, setLossOfAppetite] = useState('No');
  const [increasedMosquito, setIncreasedMosquito] = useState('No');
  const [reducedMilk, setReducedMilk] = useState('No');
  const [highMucosal, setHighMucosal] = useState('No');
  const [lymphEnlargement, setLymphEnlargement] = useState('No');
  const [laziness, setLaziness] = useState('No');

  // Assessment result state
  const [assessmentResult, setAssessmentResult] = useState<string | null>(null);

  // Helper function to get a local timestamp in "YYYY-MM-DD HH:mm:ss" format
  const getLocalTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Preview the selected image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Get latitude and longitude from the geocoding API
   */
  const getCoordinates = async (address: string) => {
    try {
      const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log("Google API Key:", googleApiKey);
      const geocodingUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.error('Geocoding error response:', data);
        return { error: data.error_message || 'Failed to fetch coordinates' };
      }
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      return { error: 'Error fetching coordinates' };
    }
  };

  /**
   * Get weather data from OpenWeatherMap API
   */
  const getWeather = async (lat: number, lng: number) => {
    try {
      const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric`;
      const response = await fetch(weatherUrl);
      const data = await response.json();
      if (data.cod === 200) {
        return {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          precipitation: data.rain ? data.rain['1h'] || 0 : 0,
          cloud_cover: data.clouds.all,
          vapor_pressure: data.main.pressure,
          latitude: lat,
          longitude: lng,
          area: data.name,
          country: data.sys.country
        };
      } else {
        console.error('Weather API error:', data);
        return { error: data.message || 'Weather data not found' };
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      return { error: 'Failed to fetch weather data' };
    }
  };

  /**
   * Main function called when user clicks "Get Weather Data"
   */
  const fetchWeatherData = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setFetchingWeather(true);
    setError('');
    setSuccess('');
    setWeatherData(null);

    try {
      // 1. Get coordinates
      const coords = await getCoordinates(address);
      if ('error' in coords) {
        setError(coords.error);
        return;
      }

      // 2. Basic parse of address for city and country (if needed)
      const addressParts = address.split(',');
      const cityName = addressParts[0].trim();
      const country = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : 'Unknown';

      // 3. Get weather using lat/lon
      const weatherInfo = await getWeather(coords.lat, coords.lng);

      if ('error' in weatherInfo) {
        setError(weatherInfo.error);
      } else {
        setWeatherData(weatherInfo as WeatherData);
      }
    } catch (err) {
      console.error('Error in fetchWeatherData:', err);
      setError('Could not retrieve weather data');
    } finally {
      setFetchingWeather(false);
    }
  };

  /**
   * Submit the LSD assessment
   */
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setError('Please upload a cattle image');
      return;
    }

    if (!weatherData) {
      setError('Please fetch location and weather data first');
      return;
    }

    if (!cattleId.trim()) {
      setError('Please enter a Cattle UID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the backend API to perform inference
      const result: PredictResponse = await predictAssessment(address, image);

      // Update state with API results
      setAssessmentResult(result.assessment);
      setAnnotatedImage("data:image/jpeg;base64," + result.annotated_image);

      // Save assessment to Firebase with local timestamp
      const assessmentData = {
        user_id: currentUser?.uid,
        cattle_uid: cattleId,
        timestamp: getLocalTimestamp(),
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        address: address,
        area: weatherData.area,
        country: weatherData.country,
        body_temperature: bodyTemp,
        skin_lesions: skinLesions,
        loss_of_appetite: lossOfAppetite,
        increased_mosquito: increasedMosquito,
        reduced_milk: reducedMilk,
        high_mucosal: highMucosal,
        lymph_enlargement: lymphEnlargement,
        laziness: laziness,
        weather_temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation,
        cloud_cover: weatherData.cloud_cover,
        vapor_pressure: weatherData.vapor_pressure,
        model_assessment: result.assessment,
      };

      push(ref(database, 'assessments'), assessmentData);

      setSuccess('Assessment complete and data saved!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 pt-24"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-white mb-8"
          variants={itemVariants}
        >
          LSD Assessment Dashboard
        </motion.h1>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Image Upload */}
        <AnimatedCard
          className="bg-[#0f172a] shadow-lg rounded-lg overflow-hidden mb-6 border border-blue-900/20"
          delay={0.1}
        >
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Upload className="h-6 w-6 text-blue-500 mr-2" />
            </motion.div>
            <h3 className="text-lg leading-6 font-medium text-white">
              1. Upload Cattle Image
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <motion.div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
              whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="cursor-pointer w-full text-center">
                {imagePreview ? (
                  <motion.img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-2" />
                    </motion.div>
                    <p>Click to upload an image of your cattle</p>
                    <p className="text-sm">(jpg, jpeg, png)</p>
                  </div>
                )}
              </label>
            </motion.div>
          </div>
        </AnimatedCard>

        {/* 2. Location & Weather */}
        <AnimatedCard
          className="bg-[#0f172a] shadow-lg rounded-lg overflow-hidden mb-6 border border-blue-900/20"
          delay={0.2}
        >
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            >
              <MapPin className="h-6 w-6 text-blue-500 mr-2" />
            </motion.div>
            <h3 className="text-lg leading-6 font-medium text-white">
              2. Get Location & Weather Data
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter address to fetch location and weather details"
                className="flex-grow px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-[#1e293b] rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <AnimatedButton
                onClick={fetchWeatherData}
                disabled={fetchingWeather}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {fetchingWeather ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Fetching...</span>
                  </div>
                ) : (
                  'Get Weather Data'
                )}
              </AnimatedButton>
            </div>

            <AnimatePresence>
              {weatherData && (
                <motion.div
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="bg-[#1e293b] p-4 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="text-white font-medium mb-2">Location</h4>
                    <p className="text-gray-300">Area: {weatherData.area}</p>
                    <p className="text-gray-300">Country: {weatherData.country}</p>
                    <p className="text-gray-300">
                      Latitude: {weatherData.latitude.toFixed(4)}
                    </p>
                    <p className="text-gray-300">
                      Longitude: {weatherData.longitude.toFixed(4)}
                    </p>
                  </motion.div>
                  <motion.div
                    className="bg-[#1e293b] p-4 rounded-lg"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-white font-medium mb-2">Weather</h4>
                    <p className="text-gray-300">
                      Temperature: {weatherData.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-gray-300">
                      Humidity: {weatherData.humidity.toFixed(1)}%
                    </p>
                    <p className="text-gray-300">
                      Precipitation: {weatherData.precipitation.toFixed(2)} mm
                    </p>
                    <p className="text-gray-300">
                      Cloud Cover: {weatherData.cloud_cover.toFixed(1)}%
                    </p>
                    <p className="text-gray-300">
                      Vapor Pressure: {weatherData.vapor_pressure.toFixed(1)} hPa
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedCard>

        {/* 3. Cattle Health Info */}
        <AnimatedCard
          className="bg-[#0f172a] shadow-lg rounded-lg overflow-hidden mb-6 border border-blue-900/20"
          delay={0.3}
        >
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
            >
              <ThermometerSun className="h-6 w-6 text-blue-500 mr-2" />
            </motion.div>
            <h3 className="text-lg leading-6 font-medium text-white">
              3. Enter Cattle Health Information
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmitAssessment}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="cattle-id" className="block text-sm font-medium text-gray-400">
                    Cattle UID
                  </label>
                  <input
                    type="text"
                    id="cattle-id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-[#1e293b] rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={cattleId}
                    onChange={(e) => setCattleId(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="body-temp" className="block text-sm font-medium text-gray-400">
                    Body Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="body-temp"
                    min="30"
                    max="45"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-[#1e293b] rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={bodyTemp}
                    onChange={(e) => setBodyTemp(parseFloat(e.target.value))}
                    required
                  />
                </motion.div>

                {/* Additional health questions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-sm font-medium text-gray-400">Skin Lesions</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="skin-lesions" value="Yes" checked={skinLesions === 'Yes'} onChange={() => setSkinLesions('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="skin-lesions" value="No" checked={skinLesions === 'No'} onChange={() => setSkinLesions('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <label className="block text-sm font-medium text-gray-400">Loss of Appetite</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="loss-of-appetite" value="Yes" checked={lossOfAppetite === 'Yes'} onChange={() => setLossOfAppetite('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="loss-of-appetite" value="No" checked={lossOfAppetite === 'No'} onChange={() => setLossOfAppetite('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <label className="block text-sm font-medium text-gray-400">Increased Mosquito Population</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="increased-mosquito" value="Yes" checked={increasedMosquito === 'Yes'} onChange={() => setIncreasedMosquito('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="increased-mosquito" value="No" checked={increasedMosquito === 'No'} onChange={() => setIncreasedMosquito('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <label className="block text-sm font-medium text-gray-400">Reduced Milk Production</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="reduced-milk" value="Yes" checked={reducedMilk === 'Yes'} onChange={() => setReducedMilk('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="reduced-milk" value="No" checked={reducedMilk === 'No'} onChange={() => setReducedMilk('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <label className="block text-sm font-medium text-gray-400">High Mucosal Discharge</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="high-mucosal" value="Yes" checked={highMucosal === 'Yes'} onChange={() => setHighMucosal('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="high-mucosal" value="No" checked={highMucosal === 'No'} onChange={() => setHighMucosal('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <label className="block text-sm font-medium text-gray-400">Lymph Node Enlargement</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="lymph-enlargement" value="Yes" checked={lymphEnlargement === 'Yes'} onChange={() => setLymphEnlargement('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="lymph-enlargement" value="No" checked={lymphEnlargement === 'No'} onChange={() => setLymphEnlargement('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <label className="block text-sm font-medium text-gray-400">Laziness in Cattle</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="laziness" value="Yes" checked={laziness === 'Yes'} onChange={() => setLaziness('Yes')} />
                      <span className="ml-2 text-gray-300">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" className="form-radio text-blue-600" name="laziness" value="No" checked={laziness === 'No'} onChange={() => setLaziness('No')} />
                      <span className="ml-2 text-gray-300">No</span>
                    </label>
                  </div>
                </motion.div>
              </div>

              <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                <AnimatedButton
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Get Assessment'
                  )}
                </AnimatedButton>
              </motion.div>
            </form>
          </div>
        </AnimatedCard>

        {/* Assessment Result */}
        <AnimatePresence>
          {assessmentResult && (
            <motion.div
              className="bg-[#0f172a] shadow-lg rounded-lg overflow-hidden border border-blue-900/20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">
                  Assessment Result
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <motion.div
                  className={`p-4 rounded-lg ${assessmentResult === 'healthy'
                      ? 'bg-green-900/50 text-green-100'
                      : assessmentResult === 'lsd suspected'
                        ? 'bg-yellow-900/50 text-yellow-100'
                        : 'bg-red-900/50 text-red-100'
                    }`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h4
                    className="text-xl font-bold capitalize mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {assessmentResult}
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {assessmentResult === 'healthy'
                      ? 'The cattle appears to be healthy based on the image analysis and provided health information.'
                      : assessmentResult === 'lsd suspected'
                        ? 'LSD is suspected based on the image analysis and/or environmental risk factors. Consider further testing.'
                        : 'LSD has been detected with high confidence. Immediate veterinary attention is recommended.'}
                  </motion.p>
                </motion.div>

                <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <p className="text-gray-400 text-sm">
                    Note: This assessment is based on AI analysis and should not replace professional veterinary diagnosis.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Annotated Image */}
        {annotatedImage && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-white">Annotated Image</h2>
            <img src={annotatedImage} alt="Annotated result" className="mt-4 rounded-lg" style={{ maxWidth: '100%' }} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
