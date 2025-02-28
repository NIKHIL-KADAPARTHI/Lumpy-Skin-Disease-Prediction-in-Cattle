import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { database } from '../firebase';
import { CattleAssessment } from '../types';
import { Activity, Calendar, Search } from 'lucide-react';

const RtPcr: React.FC = () => {
  const { currentUser } = useAuth();
  const [cattleId, setCattleId] = useState('');
  const [sampleDate, setSampleDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [matchedAssessments, setMatchedAssessments] = useState<CattleAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [rtPcrResult, setRtPcrResult] = useState<string>('Positive');

  // Helper function to convert a stored timestamp (in "YYYY-MM-DD HH:mm:ss" format)
  // to a local date string in "YYYY-MM-DD" format.
  const getLocalDate = (timestamp: string): string => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkAssessment = async () => {
    if (!cattleId.trim()) {
      setError('Please enter a valid Cattle UID');
      return;
    }

    if (!sampleDate) {
      setError('Please select a sample date');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setMatchedAssessments([]);

    try {
      const assessmentsRef = ref(database, 'assessments');
      const cattleQuery = query(
        assessmentsRef,
        orderByChild('cattle_uid'),
        equalTo(cattleId)
      );

      const snapshot = await get(cattleQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const matched: CattleAssessment[] = [];

        // Convert object to array and filter for current user's records and matching date (local time)
        Object.keys(data).forEach(key => {
          const assessment = data[key];
          if (assessment.user_id === currentUser?.uid) {
            const assessmentDate = getLocalDate(assessment.timestamp);
            if (assessmentDate === sampleDate) {
              matched.push({
                id: key,
                ...assessment
              });
            }
          }
        });

        if (matched.length === 0) {
          setError(`No assessments found for Cattle UID ${cattleId} on ${sampleDate} for your account.`);
        } else {
          setMatchedAssessments(matched);
          setSelectedAssessment(matched[0].id || '');
        }
      } else {
        setError(`No assessments found for Cattle UID ${cattleId}.`);
      }
    } catch (error) {
      setError('Error fetching assessments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitRtPcrResult = async () => {
    if (!selectedAssessment) {
      setError('Please select an assessment');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const assessmentRef = ref(database, `assessments/${selectedAssessment}`);
      await update(assessmentRef, {
        rt_pcr_result: rtPcrResult
      });

      setSuccess('RT-PCR result submitted successfully!');
      setMatchedAssessments([]);
      setSelectedAssessment('');
    } catch (error) {
      setError('Failed to submit RT-PCR result');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Activity className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-white">RT-PCR Results</h1>
        </div>

        <div className="bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">Find Assessment</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Enter the date of sample collection/assessment and the Cattle UID.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sample-date" className="block text-sm font-medium text-gray-400">
                  Date of Sample Collection/Assessment
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="sample-date"
                    className="block w-full pl-10 px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={sampleDate}
                    onChange={(e) => setSampleDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cattle-id" className="block text-sm font-medium text-gray-400">
                  Cattle UID
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cattle-id"
                    className="block w-full pl-10 px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Cattle UID"
                    value={cattleId}
                    onChange={(e) => setCattleId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={checkAssessment}
                disabled={loading}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Assessment'}
              </button>
            </div>
          </div>
        </div>

        {matchedAssessments.length > 0 && (
          <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-white">
                Select Assessment to Update with RT-PCR Result
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                Found {matchedAssessments.length} assessment(s) on {sampleDate} for Cattle UID {cattleId}.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4">
                <label htmlFor="assessment-select" className="block text-sm font-medium text-gray-400 mb-2">
                  Select Assessment
                </label>
                <select
                  id="assessment-select"
                  className="block w-full px-3 py-2 border border-gray-600 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                >
                  {matchedAssessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {new Date(assessment.timestamp).toLocaleString()} - {assessment.model_assessment}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  RT-PCR Result
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="rt-pcr-result"
                      value="Positive"
                      checked={rtPcrResult === 'Positive'}
                      onChange={() => setRtPcrResult('Positive')}
                    />
                    <span className="ml-2 text-gray-300">Positive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="rt-pcr-result"
                      value="Negative"
                      checked={rtPcrResult === 'Negative'}
                      onChange={() => setRtPcrResult('Negative')}
                    />
                    <span className="ml-2 text-gray-300">Negative</span>
                  </label>
                </div>
              </div>

              <button
                onClick={submitRtPcrResult}
                disabled={loading}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit RT-PCR Result'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RtPcr;
