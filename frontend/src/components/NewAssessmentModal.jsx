import React, { useState, useEffect } from 'react';
import { X, Activity, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw, Printer, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const PRESET_PATIENTS = [
  {
    name: 'Fatima Bello',
    Age: 28,
    SystolicBP: 135,
    DiastolicBP: 88,
    BS: 11.0,
    BodyTemp: 98.0,
    HeartRate: 78,
    label: 'High Risk Preset (Fatima Bello)'
  },
  {
    name: 'Amina Yusuf',
    Age: 29,
    SystolicBP: 125,
    DiastolicBP: 82,
    BS: 8.5,
    BodyTemp: 98.4,
    HeartRate: 76,
    label: 'Moderate Risk Preset (Amina Yusuf)'
  },
  {
    name: 'Grace Eze',
    Age: 25,
    SystolicBP: 110,
    DiastolicBP: 75,
    BS: 6.5,
    BodyTemp: 98.0,
    HeartRate: 72,
    label: 'Low Risk Preset (Grace Eze)'
  }
];

export default function NewAssessmentModal({ isOpen, onClose, onAssessmentSaved, initialPatient = null }) {
  const [patientName, setPatientName] = useState(initialPatient?.name || 'Isaac Ruth');
  const [formData, setFormData] = useState({
    Age: initialPatient?.age || 28,
    SystolicBP: 135,
    DiastolicBP: 88,
    BS: 11,
    BodyTemp: 98,
    HeartRate: 78
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      setPatientName(initialPatient.name);
      setFormData(prev => ({ ...prev, Age: initialPatient.age || 28 }));
    }
  }, [initialPatient]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value) || value
    }));
  };

  const handleApplyPreset = (preset) => {
    setPatientName(preset.name);
    setFormData({
      Age: preset.Age,
      SystolicBP: preset.SystolicBP,
      DiastolicBP: preset.DiastolicBP,
      BS: preset.BS,
      BodyTemp: preset.BodyTemp,
      HeartRate: preset.HeartRate
    });
    setResult(null);
    setError('');
  };

  const handleCalculate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.predict(formData, patientName);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to calculate risk with ML model.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await api.createAssessment({
        patient_id: initialPatient?.id || null,
        patient_name: patientName,
        age: Number(formData.Age),
        systolic_bp: Number(formData.SystolicBP),
        diastolic_bp: Number(formData.DiastolicBP),
        blood_sugar: Number(formData.BS),
        body_temp: Number(formData.BodyTemp),
        heart_rate: Number(formData.HeartRate),
        risk_level: result.risk_level,
        confidence: result.confidence,
        priority_label: result.priority_label,
        probabilities_json: JSON.stringify(result.probabilities),
        clinical_notes: `Screening completed with ${result.priority_label} (${(result.confidence * 100).toFixed(1)}% confidence).`
      });
      setSavedSuccess(true);
      if (onAssessmentSaved) onAssessmentSaved();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
        setResult(null);
      }, 1200);
    } catch (err) {
      setError('Could not save assessment: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative max-h-[92vh] overflow-y-auto fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Matches Figure 4.10 & 4.12) */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#1f5f5b] tracking-widest uppercase block mb-1">
            PERISENSE
          </span>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            New risk assessment
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enter the six measurements used by the PeriSense model. Values are screening support, not a diagnosis.
          </p>
        </div>

        {/* Quick Presets Bar */}
        {!result && (
          <div className="mb-6 bg-[#f4f8f6] p-3 rounded-2xl border border-[#dce8e1]">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1f5f5b]" />
              <span>1-Click Clinical Presets for Testing</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PATIENTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#d2e2d8] text-gray-700 hover:border-[#1f5f5b] hover:text-[#1f5f5b] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM VIEW (Figure 4.10) */}
        {!result ? (
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Patient Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Patient name
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Isaac Ruth"
                className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
              />
            </div>

            {/* 2-Column Grid of 6 Measurements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.Age}
                  onChange={(e) => handleChange('Age', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.SystolicBP}
                  onChange={(e) => handleChange('SystolicBP', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.DiastolicBP}
                  onChange={(e) => handleChange('DiastolicBP', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Blood sugar (mmol/L)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.BS}
                  onChange={(e) => handleChange('BS', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Body temperature (°F)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.BodyTemp}
                  onChange={(e) => handleChange('BodyTemp', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Heart rate (bpm)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.HeartRate}
                  onChange={(e) => handleChange('HeartRate', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white focus:outline-none rounded-xl text-sm text-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Calculate Button (Matches Screenshot: Figure 4.10) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Calculate risk with model</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* RESULT VIEW (Matches Figure 4.12 & Figure 4.11) */
          <div className="space-y-6 fade-in">
            <div className="bg-[#edf5f1] border border-[#d8e5df] p-6 rounded-2xl">
              {/* Header inside Box */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#1f5f5b] tracking-wider uppercase">
                  MODEL RESULT
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  result.badge_variant === 'High'
                    ? 'bg-[#ffe4e6] text-[#be123c]'
                    : result.badge_variant === 'Moderate'
                    ? 'bg-[#fef3c7] text-[#b45309]'
                    : 'bg-[#dcfce7] text-[#15803d]'
                }`}>
                  {result.badge_variant}
                </span>
              </div>

              {/* Priority Title & Confidence */}
              <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
                {result.priority_label}
              </h3>
              <p className="text-xs text-gray-600 mb-5 font-medium">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>

              {/* Probabilities Bars */}
              <div className="space-y-3 pt-1">
                {['high risk', 'low risk', 'mid risk'].map((cls) => {
                  const prob = result.probabilities?.[cls] || 0;
                  const pct = (prob * 100).toFixed(1);
                  return (
                    <div key={cls}>
                      <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                        <span>{cls}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-[#dbe8e0] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1f5f5b] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clinical Directives (Figure 4.11) */}
              {result.clinical_directives && result.clinical_directives.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#d8e5df] space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    Clinical Action Directives:
                  </p>
                  {result.clinical_directives.map((dir, idx) => (
                    <p key={idx} className="text-xs text-gray-800 leading-snug flex items-start space-x-1.5">
                      <span className="text-[#1f5f5b] font-bold shrink-0">(!)</span>
                      <span>{dir}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 leading-relaxed">
              Use this signal alongside clinical assessment, patient history, and local care protocols.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors text-center"
              >
                Edit inputs
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || savedSuccess}
                className="flex-1 py-3 px-4 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl text-sm transition-colors text-center disabled:opacity-75 flex items-center justify-center space-x-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save assessment</span>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                title="Print Diagnostic Report"
                className="p-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
