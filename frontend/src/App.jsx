import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import MockInterview from "./pages/mockInterview/MockInterview";
import Progress from "./pages/progress/Progress";
import InterviewDetail from "./pages/progress/InterviewDetail";
import Profile from "./pages/profile/Profile";
import Resume from "./pages/Resume";
import InterviewSession from "./pages/mockInterview/InterviewSession";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Roadmap from "./pages/roadmap/Roadmap";
import RoadmapDetail from "./pages/roadmap/RoadmapDetail";
import RoadmapHistory from "./pages/roadmap/RoadmapHistory";
import QuickQuiz from "./pages/roadmap/QuickQuiz";
import QuizHistory from "./pages/roadmap/QuizHistory";
import AIInterview from "./pages/mockInterview/AIInterview";
import AIInterviewFeedback from "./pages/mockInterview/AIInterviewFeedback";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";



const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>


        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />


        <Route path="/interview-session" element={
          <ProtectedRoute>
            <InterviewSession />
          </ProtectedRoute>
        } />
        <Route path="/ai-interview" element={
          <ProtectedRoute><AIInterview /></ProtectedRoute>
        } />
        <Route path="/ai-interview-feedback" element={
          <ProtectedRoute><AIInterviewFeedback /></ProtectedRoute>
        } />

        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<QuickQuiz />} />
          <Route path="/quiz-history" element={<QuizHistory />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/interview-detail/:id" element={<InterviewDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/roadmap/history" element={<RoadmapHistory />} />
          <Route path="/roadmap/:id" element={<RoadmapDetail />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;