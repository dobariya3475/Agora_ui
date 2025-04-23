import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../src/components/Auth/protectedRoute'
import Login from './components/Auth/Login';
import VerifyOtp from './components/Auth/VerifyOtp';
import WaitingRoom from './components/web/interview/WaitingRoom';
import { ToastContainer } from 'react-toastify';
import InterviewRoom from './components/web/interview/InterviewRoom';
// import Thankyou from './components/Thankyou';
import CodeTest from './components/web/interview/CodingTest';
import ThankyouSuccess from './components/ThankyouSuccess';


function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login/:id" element={<Login />}  />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route
          path="/waiting-room"
          element={
            <ProtectedRoute>
              <WaitingRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-room"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/thankyou"
          element={
            <ProtectedRoute>
              <ThankyouSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/codetest"
          element={
            <ProtectedRoute>
              <CodeTest />
            </ProtectedRoute>
          }
        />
        

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
