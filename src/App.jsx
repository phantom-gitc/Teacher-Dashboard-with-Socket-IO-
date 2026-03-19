import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentRegister from './pages/StudentRegister';
import TeacherRegister from './pages/TeacherRegister';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Student Dashboard Routes
import NotesGenerator from './pages/student/NotesGenerator';
import PYQAnalyzer from './pages/student/PYQAnalyzer';
import AIAssistant from './pages/student/AIAssistant';
import Quiz from './pages/student/Quiz';
import Assignments from './pages/student/Assignments';
import AskTeacher from './pages/student/AskTeacher';
import Collaboration from './pages/student/Collaboration';
import Progress from './pages/student/Progress';
import VivaAI from './pages/student/VivaAI';

const App = () => {
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
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Route>

      {/* ── Catch all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;