import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Upload,
  RefreshCw 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../services/api';

export default function Overview({ onOpenNewAssessment, onOpenBatchScreening, setActiveTab, onSelectPatient }) {
  const [analytics, setAnalytics] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, patientsData] = await Promise.all([
        api.getAnalytics(),
        api.getPatients()
      ]);
      setAnalytics(analyticsData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const chartData = [
    { name: 'Low Risk', value: analytics?.low_risk_count || 3, color: '#10b981' },
    { name: 'Moderate Risk', value: analytics?.moderate_risk_count || 1, color: '#f59e0b' },
    { name: 'High Risk', value: analytics?.high_risk_count || 2, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 fade-in max-w-6xl mx-auto">
      {/* Top Banner with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#1f5f5b] font-medium block mb-1">
            Your care workspace
          </span>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Clinical Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Continuous maternal risk screening and triage decision support.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenBatchScreening}
            className="px-4 py-2.5 border border-[#d2e2d8] hover:bg-white text-gray-700 font-medium rounded-xl text-sm transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs bg-white"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Batch Screening</span>
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

      {/* 4 Stat Metric Cards (Matches Screenshot Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Patients Monitored */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5ece8] shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f2ed] flex items-center justify-center text-[#1f5f5b] mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {analytics?.total_patients || patients.length || 6}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            Patients monitored
          </p>
        </div>

        {/* Card 2: Screenings this week */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5ece8] shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f2ed] flex items-center justify-center text-[#1f5f5b] mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {analytics?.screenings_this_week || 37}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            Screenings this week
          </p>
        </div>

        {/* Card 3: High risk cases */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5ece8] shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#ffe4e6] flex items-center justify-center text-[#be123c] mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {analytics?.high_risk_count || 2}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            High risk cases
          </p>
        </div>

        {/* Card 4: Cohort risk correlation */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5ece8] shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#e8f2ed] flex items-center justify-center text-[#1f5f5b] mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {analytics?.cohort_correlation || '89%'}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            Cohort risk correlation
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Clinical Patients & Assessments */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e5ece8] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-2 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Recent patient activity</h2>
            <button
              onClick={() => setActiveTab('patients')}
              className="text-xs font-semibold text-[#1f5f5b] hover:text-[#164e4a] flex items-center space-x-0.5"
            >
              <span>View all patients</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#1f5f5b]" />
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No recent assessments recorded.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {patients.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient && onSelectPatient(p)}
                  className="py-3.5 px-2 -mx-2 rounded-xl hover:bg-[#f9faf9] cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1f5f5b] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.patient_code} · {p.age} years · {p.gestational_age || '20 Weeks'}
                    </p>
                  </div>
                  <div>
                    {getRiskBadge(p.latest_risk_status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Risk Breakdown & Triage Summary */}
        <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Cohort Risk Ratio</h2>
            <p className="text-xs text-gray-500 mb-4">Patient risk distribution across the registered cohort.</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value} patients</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 bg-[#f9faf9] p-3.5 rounded-2xl">
            <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Obstetric AI Protocol</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Random Forest model predicts based on Blood Sugar, Systolic & Diastolic BP, Age, Heart Rate, and Body Temperature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
