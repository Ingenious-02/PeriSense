import React from 'react';
import { X, ChevronRight, Activity, Calendar, Heart, Thermometer, Droplet, User, Phone, FileText } from 'lucide-react';

export default function PatientRecordModal({ patient, onClose, onNewAssessmentForPatient }) {
  if (!patient) return null;

  const riskStatus = patient.latest_risk_status || 'Low';
  const isHigh = riskStatus.toLowerCase().includes('high');
  const isMod = riskStatus.toLowerCase().includes('mod') || riskStatus.toLowerCase().includes('mid');

  const badgeClass = isHigh
    ? 'bg-[#ffe4e6] text-[#be123c]'
    : isMod
    ? 'bg-[#fef3c7] text-[#b45309]'
    : 'bg-[#dcfce7] text-[#15803d]';

  const formattedDate = patient.latest_assessment_date 
    ? new Date(patient.latest_assessment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Aug 26, 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Figure 4.15) */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#1f5f5b] tracking-widest uppercase block mb-1">
            PERISENSE
          </span>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {patient.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {patient.patient_code} · {patient.age} years · Gestational Age: {patient.gestational_age || '24 Weeks'}
          </p>
        </div>

        {/* Clinical Context Banner (Figure 4.15) */}
        <div className="bg-[#edf5f1] border border-[#d8e5df] p-5 rounded-2xl mb-6">
          <div className="mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
              {riskStatus}
            </span>
          </div>
          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            {isHigh
              ? 'Model confidence: 100.0%. Review the complete clinical context before action.'
              : isMod
              ? 'Model confidence: 74.5%. Moderate risk signals detected. Review vital trends.'
              : 'Model confidence: 88.0%. Maternal vitals within normal parameters.'}
          </p>
        </div>

        {/* Patient Details & Notes */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Contact</span>
              <span className="font-medium text-gray-800">{patient.phone || '+234 800 000 0000'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Last Assessment</span>
              <span className="font-medium text-gray-800">{formattedDate}</span>
            </div>
            <div className="py-1">
              <span className="text-gray-500 block mb-1">Clinical Notes</span>
              <p className="text-gray-800 italic bg-white p-2.5 rounded-lg border border-gray-200">
                {patient.notes || 'No recent complications reported.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button (Figure 4.15: "Close record >") */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-xl text-sm transition-colors flex items-center justify-center space-x-1"
          >
            <span>Close record</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNewAssessmentForPatient) onNewAssessmentForPatient(patient);
            }}
            className="w-full py-3 px-4 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Conduct New Assessment for {patient.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
