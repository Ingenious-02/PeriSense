import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Overview from './components/Overview';
import PatientsDirectory from './components/PatientsDirectory';
import AssessmentsList from './components/AssessmentsList';
import NotificationsView from './components/NotificationsView';
import ProfileAndDiagnostics from './components/ProfileAndDiagnostics';
import NewAssessmentModal from './components/NewAssessmentModal';
import BatchScreeningModal from './components/BatchScreeningModal';
import PatientRecordModal from './components/PatientRecordModal';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import { api } from './services/api';
import { Activity } from 'lucide-react';

function MainApp() {
  const { user, loading, isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [isBatchScreeningOpen, setIsBatchScreeningOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assessmentTargetPatient, setAssessmentTargetPatient] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Ignore if unauthenticated
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [activeTab, isAuthenticated]);

  // If session is still loading, display elegant splash loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8f6] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1f5f5b] text-white flex items-center justify-center shadow-lg animate-pulse mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <p className="text-xs font-bold text-[#1f5f5b] tracking-widest uppercase">
          PERISENSE CARE INTELLIGENCE
        </p>
        <p className="text-xs text-gray-400 mt-1">Initializing secure clinical workspace...</p>
      </div>
    );
  }

  // If not authenticated, display full-screen Clinician Portal
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const handleOpenNewAssessment = (patient = null) => {
    setAssessmentTargetPatient(patient);
    setIsNewAssessmentOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            onOpenNewAssessment={handleOpenNewAssessment}
            onOpenBatchScreening={() => setIsBatchScreeningOpen(true)}
            setActiveTab={setActiveTab}
            onSelectPatient={(p) => setSelectedPatient(p)}
          />
        );
      case 'patients':
        return (
          <PatientsDirectory
            onOpenNewAssessment={handleOpenNewAssessment}
          />
        );
      case 'assessments':
        return (
          <AssessmentsList
            onOpenNewAssessment={handleOpenNewAssessment}
            onOpenBatchScreening={() => setIsBatchScreeningOpen(true)}
          />
        );
      case 'notifications':
        return (
          <NotificationsView
            onOpenPatientDetail={(p) => setSelectedPatient(p)}
            onOpenNewAssessment={handleOpenNewAssessment}
          />
        );
      case 'profile':
        return <ProfileAndDiagnostics />;
      default:
        return <Overview onOpenNewAssessment={handleOpenNewAssessment} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setActiveTab('notifications')}
          unreadCount={unreadCount}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Modals */}
      <NewAssessmentModal
        isOpen={isNewAssessmentOpen}
        onClose={() => {
          setIsNewAssessmentOpen(false);
          setAssessmentTargetPatient(null);
        }}
        initialPatient={assessmentTargetPatient}
        onAssessmentSaved={() => {
          fetchUnreadCount();
        }}
      />

      <BatchScreeningModal
        isOpen={isBatchScreeningOpen}
        onClose={() => setIsBatchScreeningOpen(false)}
        onBatchCompleted={() => {
          fetchUnreadCount();
        }}
      />

      {selectedPatient && (
        <PatientRecordModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onNewAssessmentForPatient={(p) => handleOpenNewAssessment(p)}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={(p) => setSelectedPatient(p)}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
