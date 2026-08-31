import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function BatchScreeningModal({ isOpen, onClose, onBatchCompleted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent = `Name,Age,SystolicBP,DiastolicBP,BS,BodyTemp,HeartRate
Fatima Bello,34,140,95,12.0,98.6,88
Grace Eze,25,110,75,6.5,98.0,72
Amina Yusuf,29,125,82,8.5,98.4,76
Chidinma Okafor,31,115,78,7.2,98.2,74
Isaac Ruth,28,135,88,11.0,98.0,78
Zainab Abba,22,105,70,6.0,98.0,70`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'PeriSense_Batch_Screening_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadAndScreen = async () => {
    if (!file) {
      setError('Please select a CSV file to screen.');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.batchPredict(formData);
      setResult(res);
      if (onBatchCompleted) onBatchCompleted();
    } catch (err) {
      setError(err.message || 'Error processing batch screening.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = () => {
    if (!result?.results) return;
    const header = 'Row,Patient Name,Age,Systolic BP,Diastolic BP,Blood Sugar,Body Temp,Heart Rate,Predicted Risk Level,Confidence,Priority\n';
    const rows = result.results.map(r => 
      `${r.row_id},"${r.patient_name}",${r.Age},${r.SystolicBP},${r.DiastolicBP},${r.BS},${r.BodyTemp},${r.HeartRate},"${r.risk_level}",${(r.confidence * 100).toFixed(1)}%,"${r.priority_label}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PeriSense_Scored_Batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#1f5f5b] tracking-widest uppercase block mb-1">
            PERISENSE POPULATION SCREENING
          </span>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Batch Maternal Health Risk Screening
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload CSV patient records for high-throughput automated maternal risk classification.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <div className="space-y-6">
            {/* Dropzone */}
            <div className="border-2 border-dashed border-[#c5dcd0] hover:border-[#1f5f5b] bg-[#f9fbf9] p-8 rounded-2xl text-center transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-[#1f5f5b] mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {file ? file.name : 'Select or drag & drop patient CSV'}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported columns: Name, Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate
              </p>
              <label className="inline-block px-4 py-2 bg-[#1f5f5b] hover:bg-[#164e4a] text-white text-xs font-medium rounded-xl cursor-pointer transition-colors">
                <span>Browse file</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
              </label>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-[#eef6f2] rounded-2xl border border-[#d6e7de]">
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Need a sample format?</h4>
                <p className="text-[11px] text-gray-600">Download the PeriSense standardized maternal vitals template.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 bg-white border border-[#c1d9cc] text-[#1f5f5b] hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={loading || !file}
              onClick={handleUploadAndScreen}
              className="w-full py-3.5 px-6 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Process Batch Screening with Model</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Scored Results View */
          <div className="space-y-6 fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-xl font-bold text-gray-900">{result.total_processed}</span>
                <p className="text-[11px] text-gray-500">Processed</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-center">
                <span className="text-xl font-bold text-rose-700">{result.high_risk_count}</span>
                <p className="text-[11px] text-rose-600 font-medium">High Risk</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center">
                <span className="text-xl font-bold text-amber-700">{result.mid_risk_count}</span>
                <p className="text-[11px] text-amber-600 font-medium">Moderate</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <span className="text-xl font-bold text-emerald-700">{result.low_risk_count}</span>
                <p className="text-[11px] text-emerald-600 font-medium">Low Risk</p>
              </div>
            </div>

            {/* Scored Table Preview */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-700 sticky top-0">
                  <tr>
                    <th className="p-2.5 font-semibold">Patient</th>
                    <th className="p-2.5 font-semibold">Vitals (BP / BS)</th>
                    <th className="p-2.5 font-semibold">Predicted Risk</th>
                    <th className="p-2.5 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.results.map((r) => {
                    const isHigh = r.risk_level.toLowerCase().includes('high');
                    const isMod = r.risk_level.toLowerCase().includes('mid') || r.risk_level.toLowerCase().includes('mod');
                    const badge = isHigh ? 'bg-[#ffe4e6] text-[#be123c]' : isMod ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#15803d]';
                    return (
                      <tr key={r.row_id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-medium text-gray-900">{r.patient_name} ({r.Age}y)</td>
                        <td className="p-2.5 text-gray-600">{r.SystolicBP}/{r.DiastolicBP} mmHg · {r.BS} mmol/L</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${badge}`}>
                            {r.priority_label}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-gray-700">{(r.confidence * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Screen Another File
              </button>
              <button
                type="button"
                onClick={handleExportResults}
                className="flex-1 py-2.5 px-4 bg-[#1f5f5b] hover:bg-[#164e4a] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Scored CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
