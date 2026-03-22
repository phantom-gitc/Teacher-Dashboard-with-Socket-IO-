import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { connectSocket, disconnectSocket } from './lib/socket';
import Login from './pages/Login';
import StudentRegister from './pages/StudentRegister';
import TeacherRegister from './pages/TeacherRegister';
import ProtectedRoute from './components/ProtectedRoute';

// ── Student Pages ──
import StudentDashboard from './pages/student/Dashboard';
import NotesGenerator from './pages/student/NotesGenerator';
import PYQAnalyzer from './pages/student/PYQAnalyzer';
import AIAssistant from './pages/student/AIAssistant';
import Quiz from './pages/student/Quiz';
import Assignments from './pages/student/Assignments';
import AskTeacher from './pages/student/AskTeacher';
import Collaboration from './pages/student/Collaboration';
import Progress from './pages/student/Progress';
import VivaAI from './pages/student/VivaAI';

// ── Teacher Pages ──
import TeacherDashboardHome from './pages/teacher/TeacherDashboardHome';
import AIAssignmentGenerator from './pages/teacher/AIAssignmentGenerator';
import CreateAssignment from './pages/teacher/CreateAssignment';
import Submissions from './pages/teacher/Submissions';
import Evaluation from './pages/teacher/Evaluation';
import StudentChats from './pages/teacher/StudentChats';
import Announcements from './pages/teacher/Announcements';
import Analytics from './pages/teacher/Analytics';

const App = () => {
  const { isAuthenticated, initAuth } = useAuthStore();

  // On mount — validate existing token and reconnect socket
  useEffect(() => {
    initAuth();
  }, []);

  // Connect socket when authenticated, disconnect when logged out
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route path="/register/teacher" element={<TeacherRegister />} />

      {/* ── Student Routes ── */}
      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/notes" element={<NotesGenerator />} />
        <Route path="/student/pyq" element={<PYQAnalyzer />} />
        <Route path="/student/ai" element={<AIAssistant />} />
        <Route path="/student/viva" element={<VivaAI />} />
        <Route path="/student/quiz" element={<Quiz />} />
        <Route path="/student/assignments" element={<Assignments />} />
        <Route path="/student/ask-teacher" element={<AskTeacher />} />
        <Route path="/student/collaboration" element={<Collaboration />} />
        <Route path="/student/progress" element={<Progress />} />
      </Route>

      {/* ── Teacher Routes ── */}
      <Route element={<ProtectedRoute allowedRole="teacher" />}>
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardHome />} />
        <Route path="/teacher/ai-generator" element={<AIAssignmentGenerator />} />
        <Route path="/teacher/create-assignment" element={<CreateAssignment />} />
        <Route path="/teacher/submissions" element={<Submissions />} />
        <Route path="/teacher/evaluation" element={<Evaluation />} />
        <Route path="/teacher/chats" element={<StudentChats />} />
        <Route path="/teacher/announcements" element={<Announcements />} />
        <Route path="/teacher/analytics" element={<Analytics />} />
      </Route>

      {/* ── Catch all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;