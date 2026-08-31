import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  BrainCircuit, 
  BarChart3, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Award, 
  RefreshCw, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfileAndDiagnostics() {
  const { user } = useAuth();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConfusionModel, setSelectedConfusionModel] = useState('Random Forest');

  useEffect(() => {
    async function load() {
      try {
        const info = await api.getModelInfo();
        setModelInfo(info);
      } catch (err) {
        console.error('Error fetching model info:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featureImportanceData = [
    { feature: 'BS (Blood Sugar)', importance: 35.2, fill: '#1f5f5b' },
    { feature: 'SystolicBP', importance: 19.3, fill: '#2d7a75' },
    { feature: 'Age', importance: 15.8, fill: '#3d948e' },
    { feature: 'DiastolicBP', importance: 12.7, fill: '#52aea7' },
    { feature: 'HeartRate', importance: 10.3, fill: '#72c4be' },
    { feature: 'BodyTemp', importance: 6.6, fill: '#9ddad5' },
  ];

  const modelComparisonData = [
    { name: 'Logistic Regression', Accuracy: 62.2, Precision: 61.1, Recall: 62.2, 'F1 Score': 60.5 },
    { name: 'SVM', Accuracy: 72.6, Precision: 74.5, Recall: 72.6, 'F1 Score': 71.0 },
    { name: 'Decision Tree', Accuracy: 83.8, Precision: 85.9, Recall: 83.8, 'F1 Score': 84.1 },
    { name: 'Random Forest', Accuracy: 86.6, Precision: 87.0, Recall: 86.6, 'F1 Score': 86.5 },
  ];

  const confusionMatrixData = {
    'Random Forest': [
      [48, 2, 5],
      [1, 75, 6],
      [4, 9, 51]
    ],
    'Decision Tree': [
      [46, 3, 6],
      [2, 73, 7],
      [6, 9, 49]
    ],
    'SVM': [
      [39, 4, 12],
      [3, 68, 11],
      [8, 18, 38]
    ],
    'Logistic Regression': [
      [32, 8, 15],
      [7, 60, 15],
      [14, 18, 32]
    ]
  };

  const classes = ['High Risk', 'Low Risk', 'Mid Risk'];

  return (
    <div className="space-y-8 fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-xs text-[#1f5f5b] font-medium block mb-1">
          Clinician Workspace & AI Architecture
        </span>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
          Profile & Intelligence Engine
        </h1>
        <p className="text-sm text-gray-500">
          Model validation benchmarks, feature rankings, and clinician profile credentials.
        </p>
      </div>

      {/* Clinician Card */}
      <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#1f5f5b] text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DA'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900">{user?.name || 'Dr. Adeyemi'}</h2>
              <span className="px-2.5 py-0.5 bg-[#e8f2ed] text-[#1f5f5b] rounded-full text-[10px] font-bold">
                Verified Clinician
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user?.role || 'Lead Obstetrician'} · Maternal-Fetal Health</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email || 'adeyemi@perisense.health'}</p>
          </div>
        </div>

        <div className="bg-[#f2f7f4] p-3 rounded-2xl border border-[#dce8e1] text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-gray-700">
            <ShieldCheck className="w-4 h-4 text-[#1f5f5b]" />
            <span className="font-semibold">Security & Data Privacy</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            Decoupled PII architecture with client-side anonymization engine.
          </p>
        </div>
      </div>

      {/* Model Benchmark Comparison (Figure 4.17) */}
      <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[11px] font-bold text-[#1f5f5b] uppercase tracking-wider block mb-1">
              FIGURE 4.17 BENCHMARK
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              Performance Comparison of Machine Learning Models
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Random Forest demonstrated top classification accuracy (86.6%) and highest F1-score (86.5%).
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Accuracy" fill="#1f5f5b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1 Score" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix Grid (Figures 4.20 & 4.24) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#1f5f5b] uppercase tracking-wider block mb-1">
              FIGURE 4.24
            </span>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Random Forest Feature Importance
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Blood Sugar (BS) & Systolic BP account for over 54% of maternal risk decision weight.
            </p>

            <div className="space-y-3.5">
              {featureImportanceData.map((f) => (
                <div key={f.feature}>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>{f.feature}</span>
                    <span className="font-semibold text-gray-900">{f.importance}%</span>
                  </div>
                  <div className="w-full bg-[#edf5f1] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#1f5f5b] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${f.importance * 2.5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Ensemble Estimators: 100 Trees</span>
            <span>Criterion: Gini Impurity</span>
          </div>
        </div>

        {/* Confusion Matrix Diagnostic Grid */}
        <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#1f5f5b] uppercase tracking-wider">
                FIGURE 4.20 DIAGNOSTICS
              </span>
              <select
                value={selectedConfusionModel}
                onChange={(e) => setSelectedConfusionModel(e.target.value)}
                className="text-xs bg-[#f2f7f4] border border-[#d2e2d8] rounded-lg px-2 py-1 text-gray-800 font-medium outline-none"
              >
                {Object.keys(confusionMatrixData).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Confusion Matrix Diagnostics
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Prediction accuracy across High, Low, and Mid maternal risk classes.
            </p>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-gray-400 font-normal">True \ Pred</th>
                    {classes.map((c) => (
                      <th key={c} className="p-2 font-semibold text-gray-700">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {confusionMatrixData[selectedConfusionModel].map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="p-2 text-left font-semibold text-gray-700">{classes[rowIdx]}</td>
                      {row.map((val, colIdx) => {
                        const isDiag = rowIdx === colIdx;
                        return (
                          <td 
                            key={colIdx}
                            className={`p-3 rounded-lg font-bold ${
                              isDiag
                                ? 'bg-[#e8f2ed] text-[#1f5f5b]'
                                : val > 5
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Correctly Classified: 174 / 201</span>
            <span className="font-semibold text-emerald-700">Test Accuracy: 86.6%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
