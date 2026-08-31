import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, RefreshCw, AlertCircle, ChevronRight, User } from 'lucide-react';
import { api } from '../services/api';
import PatientRecordModal from './PatientRecordModal';

export default function PatientsDirectory({ onOpenNewAssessment }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    patient_code: `PS-${Math.floor(1000 + Math.random() * 9000)}`,
    age: 26,
    gestational_age: '16 Weeks',
    phone: '',
    notes: ''
  });
  const [registering, setRegistering] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients(search, riskFilter === 'All' ? '' : riskFilter);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, riskFilter]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await api.createPatient(newPatient);
      setShowRegisterModal(false);
      setNewPatient({
        name: '',
        patient_code: `PS-${Math.floor(1000 + Math.random() * 9000)}`,
        age: 26,
        gestational_age: '16 Weeks',
        phone: '',
        notes: ''
      });
      fetchPatients();
    } catch (err) {
      alert('Error registering patient: ' + err.message);
    } finally {
      setRegistering(false);
    }
  };

  const getBadgeStyle = (status) => {
    const s = (status || 'Low').toLowerCase();
    if (s.includes('high')) {
      return 'bg-[#ffe4e6] text-[#be123c]';
    }
    if (s.includes('mod') || s.includes('mid')) {
      return 'bg-[#fef3c7] text-[#b45309]';
    }
    return 'bg-[#dcfce7] text-[#15803d]';
  };

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      {/* Page Header (Figure 4.14) */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Patients</h1>
        <p className="text-sm text-gray-500">Review patient context and risk signals.</p>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onOpenNewAssessment()}
          className="px-5 py-2.5 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl text-sm transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <span>New assessment</span>
        </button>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-gray-500" />
          <span>Register patient</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar Container (Figure 4.14) */}
      <div className="bg-white rounded-2xl border border-[#e5ece8] p-6 shadow-xs">
        {/* Search Input Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 placeholder-gray-500 transition-all"
          />
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center space-x-2 mb-6 pb-2 border-b border-gray-100">
          {['All', 'High', 'Moderate', 'Low'].map((tab) => (
            <button
              key={tab}
              onClick={() => setRiskFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                riskFilter === tab
                  ? 'bg-[#1f5f5b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'All' ? 'All Patients' : `${tab} Risk`}
            </button>
          ))}
        </div>

        {/* Patients List (Figure 4.14) */}
        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1f5f5b]" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No patient records match your search query.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {patients.map((patient) => {
              const status = patient.latest_risk_status || 'Low';
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="py-4 px-3 -mx-3 rounded-xl hover:bg-[#f9faf9] cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1f5f5b] transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {patient.patient_code} · {patient.age} years
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyle(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Record Detail Modal (Figure 4.15) */}
      {selectedPatient && (
        <PatientRecordModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onNewAssessmentForPatient={(p) => onOpenNewAssessment(p)}
        />
      )}

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Register New Patient</h3>
            <p className="text-xs text-gray-500 mb-4">Add a new maternal health patient to the clinical registry.</p>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Maryam Abubakar"
                  className="w-full px-3 py-2 bg-[#f2f7f4] border rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 bg-[#f2f7f4] border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gestational Age</label>
                  <input
                    type="text"
                    value={newPatient.gestational_age}
                    onChange={(e) => setNewPatient({ ...newPatient, gestational_age: e.target.value })}
                    placeholder="e.g. 20 Weeks"
                    className="w-full px-3 py-2 bg-[#f2f7f4] border rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="e.g. +234 800 000 0000"
                  className="w-full px-3 py-2 bg-[#f2f7f4] border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                  placeholder="Medical history, allergies, notes..."
                  className="w-full px-3 py-2 bg-[#f2f7f4] border rounded-lg text-xs"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2 text-xs border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 py-2 text-xs bg-[#1f5f5b] text-white font-medium rounded-lg hover:bg-[#164e4a]"
                >
                  {registering ? 'Saving...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
