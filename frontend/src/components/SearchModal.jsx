import React, { useState, useEffect } from 'react';
import { Search, X, User, Activity, Bell, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function SearchModal({ isOpen, onClose, onSelectPatient, onOpenAssessment }) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setPatients([]);
      setAssessments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [patData, assData] = await Promise.all([
          api.getPatients(query),
          api.getAssessments(query)
        ]);
        setPatients(patData || []);
        setAssessments(assData || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative max-h-[80vh] overflow-y-auto fade-in">
        {/* Search Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-[#1f5f5b]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, ID codes, screenings..."
            className="w-full text-base text-gray-900 placeholder-gray-400 outline-none"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 space-y-4">
          {query.trim() === '' ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Type a patient name or ID to quickly jump to records.
            </p>
          ) : loading ? (
            <p className="text-xs text-gray-400 text-center py-8">Searching care database...</p>
          ) : patients.length === 0 && assessments.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No matching records found for "{query}".</p>
          ) : (
            <>
              {patients.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Patients</p>
                  <div className="space-y-1">
                    {patients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose();
                          if (onSelectPatient) onSelectPatient(p);
                        }}
                        className="p-3 bg-[#f8faf9] hover:bg-[#edf5f1] rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-gray-400 group-hover:text-[#1f5f5b]" />
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                            <p className="text-[10px] text-gray-500">{p.patient_code} · {p.age} years</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.latest_risk_status === 'High' ? 'bg-[#ffe4e6] text-[#be123c]' :
                          p.latest_risk_status === 'Moderate' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#15803d]'
                        }`}>
                          {p.latest_risk_status || 'Low'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assessments.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Screening Records</p>
                  <div className="space-y-1">
                    {assessments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onClose();
                          if (onOpenAssessment) onOpenAssessment(a);
                        }}
                        className="p-3 bg-[#f8faf9] hover:bg-[#edf5f1] rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Activity className="w-4 h-4 text-gray-400 group-hover:text-[#1f5f5b]" />
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{a.patient_name}</p>
                            <p className="text-[10px] text-gray-500">BP: {a.systolic_bp}/{a.diastolic_bp} · BS: {a.blood_sugar}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{a.priority_label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
