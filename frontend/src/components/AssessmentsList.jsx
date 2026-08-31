import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, RefreshCw, FileText, Download, Calendar, Activity, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function AssessmentsList({ onOpenNewAssessment, onOpenBatchScreening }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await api.getAssessments(search, riskFilter === 'All' ? '' : riskFilter);
      setAssessments(data);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [search, riskFilter]);

  const getRiskBadge = (risk) => {
    const r = (risk || 'Low').toLowerCase();
    if (r.includes('high')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffe4e6] text-[#be123c]">High</span>;
    }
    if (r.includes('mod') || r.includes('mid')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309]">Moderate</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d]">Low</span>;
  };

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Assessments Registry</h1>
          <p className="text-sm text-gray-500">Historical maternal risk screenings and model diagnostic logs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenBatchScreening}
            className="px-4 py-2.5 bg-white border border-[#d2e2d8] hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Batch Upload</span>
          </button>

          <button
            onClick={() => onOpenNewAssessment()}
            className="px-5 py-2.5 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl text-sm transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New assessment</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-[#e5ece8] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-xs text-gray-900 transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
            {['All', 'High', 'Mid', 'Low'].map((tab) => (
              <button
                key={tab}
                onClick={() => setRiskFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  riskFilter === tab
                    ? 'bg-[#1f5f5b] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'All' ? 'All Screenings' : tab === 'Mid' ? 'Moderate Risk' : `${tab} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1f5f5b]" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No assessment logs found. Click "+ New assessment" to screen a patient.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f9faf9] text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-3 font-semibold">Age</th>
                  <th className="py-3 px-3 font-semibold">Blood Pressure</th>
                  <th className="py-3 px-3 font-semibold">Blood Sugar</th>
                  <th className="py-3 px-3 font-semibold">Heart Rate</th>
                  <th className="py-3 px-3 font-semibold">Body Temp</th>
                  <th className="py-3 px-3 font-semibold">Model Classification</th>
                  <th className="py-3 px-3 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assessments.map((a) => {
                  const dateStr = new Date(a.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedRecord(a)}
                      className="hover:bg-[#f9faf9] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{a.patient_name}</td>
                      <td className="py-3.5 px-3 text-gray-700">{a.age} yrs</td>
                      <td className="py-3.5 px-3 font-medium text-gray-800">{a.systolic_bp}/{a.diastolic_bp} mmHg</td>
                      <td className="py-3.5 px-3 font-medium text-gray-800">{a.blood_sugar} mmol/L</td>
                      <td className="py-3.5 px-3 text-gray-700">{a.heart_rate} bpm</td>
                      <td className="py-3.5 px-3 text-gray-700">{a.body_temp} °F</td>
                      <td className="py-3.5 px-3">{getRiskBadge(a.risk_level)}</td>
                      <td className="py-3.5 px-3 font-semibold text-gray-800">{(a.confidence * 100).toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-gray-500">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assessment Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative fade-in">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
            <span className="text-[11px] font-bold text-[#1f5f5b] tracking-widest uppercase block mb-1">PERISENSE TRIAGE RECORD</span>
            <h2 className="text-xl font-bold text-gray-900">{selectedRecord.patient_name}</h2>
            <p className="text-xs text-gray-500 mb-4">Assessment ID #{selectedRecord.id}</p>

            <div className="bg-[#edf5f1] border border-[#d8e5df] p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-[#1f5f5b]">RESULT</span>
                {getRiskBadge(selectedRecord.risk_level)}
              </div>
              <p className="text-base font-bold text-gray-900">{selectedRecord.priority_label}</p>
              <p className="text-xs text-gray-600">Model Confidence: {(selectedRecord.confidence * 100).toFixed(1)}%</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Blood Pressure</span>
                <span className="font-semibold text-gray-900">{selectedRecord.systolic_bp}/{selectedRecord.diastolic_bp} mmHg</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Blood Glucose (BS)</span>
                <span className="font-semibold text-gray-900">{selectedRecord.blood_sugar} mmol/L</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Body Temperature</span>
                <span className="font-semibold text-gray-900">{selectedRecord.body_temp} °F</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Heart Rate</span>
                <span className="font-semibold text-gray-900">{selectedRecord.heart_rate} bpm</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 bg-[#1f5f5b] text-white rounded-xl text-xs font-semibold hover:bg-[#164e4a]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
