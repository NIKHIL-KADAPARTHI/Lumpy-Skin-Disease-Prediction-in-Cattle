import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { CattleAssessment } from '../types';
import { Database, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const CattleInfo: React.FC = () => {
  const { currentUser } = useAuth();
  const [allAssessments, setAllAssessments] = useState<CattleAssessment[]>([]);
  const [selectedCattleId, setSelectedCattleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all assessments for the current user
  const fetchAllAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const assessmentsRef = ref(database, 'assessments');
      const snapshot = await get(assessmentsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const assessmentsList: CattleAssessment[] = [];
        Object.keys(data).forEach((key) => {
          const assessment = data[key];
          if (assessment.user_id === currentUser?.uid) {
            assessmentsList.push({ id: key, ...assessment });
          }
        });
        if (assessmentsList.length === 0) {
          setError('No records found for your account.');
        } else {
          setAllAssessments(assessmentsList);
          // Set default selected cattle UID to the first unique one
          const uniqueIds = Array.from(new Set(assessmentsList.map((a) => a.cattle_uid)));
          setSelectedCattleId(uniqueIds[0]);
        }
      } else {
        setError('No records found.');
      }
    } catch (err) {
      setError('Error fetching cattle information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllAssessments();
    }
  }, [currentUser]);

  // Get unique cattle UIDs from assessments
  const uniqueCattleIds = Array.from(new Set(allAssessments.map((a) => a.cattle_uid)));

  // Filter assessments for the selected cattle UID and sort by timestamp (most recent first)
  const filteredAssessments = allAssessments
    .filter((a) => a.cattle_uid === selectedCattleId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Animation variants (same as before)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 pt-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="flex items-center mb-8" variants={itemVariants}>
          <Database className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-white">Cattle Information</h1>
        </motion.div>

        {loading && (
          <motion.div className="mb-4 text-white" variants={itemVariants}>
            Loading assessments...
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
            variants={itemVariants}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {/* If assessments exist, display dropdown to select cattle UID */}
        {uniqueCattleIds.length > 0 && (
          <motion.div className="mb-8" variants={itemVariants}>
            <label htmlFor="cattle-select" className="block text-sm font-medium text-gray-300 mb-2">
              Select Cattle UID:
            </label>
            <select
              id="cattle-select"
              className="block w-full px-3 py-2 border border-gray-600 bg-[#1e293b] text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCattleId}
              onChange={(e) => setSelectedCattleId(e.target.value)}
            >
              {uniqueCattleIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {filteredAssessments.length > 0 && (
          <motion.div
            className="bg-[#0f172a] shadow-lg rounded-lg overflow-hidden border border-blue-900/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-white">
                Health Records for Cattle UID: {selectedCattleId}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                Showing {filteredAssessments.length} record(s)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1e293b]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Health Information
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Assessment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      RT-PCR Results
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#0f172a] divide-y divide-gray-700">
                  {filteredAssessments.map((assessment, index) => {
                    // Format the date
                    const date = new Date(assessment.timestamp).toLocaleDateString();
                    // Compile health issues
                    const healthIssues = [];
                    if (assessment.skin_lesions === 'Yes') healthIssues.push('Skin Lesions');
                    if (assessment.loss_of_appetite === 'Yes') healthIssues.push('Loss of Appetite');
                    if (assessment.increased_mosquito === 'Yes') healthIssues.push('Increased Mosquito Population');
                    if (assessment.reduced_milk === 'Yes') healthIssues.push('Reduced Milk Production');
                    if (assessment.high_mucosal === 'Yes') healthIssues.push('High Mucosal Discharge');
                    if (assessment.lymph_enlargement === 'Yes') healthIssues.push('Lymph Node Enlargement');
                    if (assessment.laziness === 'Yes') healthIssues.push('Laziness');
                    const healthInfo =
                      healthIssues.length > 0 ? healthIssues.join(', ') : 'No health issues reported';

                    return (
                      <motion.tr
                        key={assessment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-[#1e293b]/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{date}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{healthInfo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assessment.model_assessment === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : assessment.model_assessment === 'lsd suspected'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {assessment.model_assessment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {assessment.rt_pcr_result || 'Not available'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CattleInfo;
