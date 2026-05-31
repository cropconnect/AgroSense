import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AIAdvisor from './pages/AIAdvisor.jsx';
import Alerts from './pages/Alerts.jsx';
import Climate from './pages/Climate.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Market from './pages/Market.jsx';
import Profile from './pages/Profile.jsx';
import Pumps from './pages/Pumps.jsx';
import Sensors from './pages/Sensors.jsx';
import Water from './pages/Water.jsx';
import Weather from './pages/Weather.jsx';
import Signup from './pages/Signup.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="shell">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/climate" element={<PrivateRoute><Climate /></PrivateRoute>} />
          <Route path="/water" element={<PrivateRoute><Water /></PrivateRoute>} />
          <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
          <Route path="/ai" element={<PrivateRoute><AIAdvisor /></PrivateRoute>} />
          <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
          <Route path="/pumps" element={<PrivateRoute><Pumps /></PrivateRoute>} />
          <Route path="/sensors" element={<PrivateRoute><Sensors /></PrivateRoute>} />
          <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<Navigate to="/profile" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
