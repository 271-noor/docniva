import React from "react";
import Home from "../pages/public/Home";
import RoleSelection from "../pages/public/RoleSelection";

import PatientLogin from "../pages/patient/PatientLogin";
import PatientRegister from "../pages/patient/PatientRegister";
import PatientDashboard from "../pages/patient/PatientDashboard";
import FindDoctor from "../pages/patient/FindDoctor";
import PatientDoctorProfile from "../pages/patient/DoctorProfile";
import BookAppointment from "../pages/patient/BookAppointment";
import AppointmentConfirmed from "../pages/patient/AppointmentConfirmed";
import PatientAppointments from "../pages/patient/PatientAppointment";

import DoctorLogin from "../pages/doctor/DoctorLogin";
import DoctorRegister from "../pages/doctor/DoctorRegister";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorProfile from "../pages/doctor/DoctorProfile";

import NotFound from "../pages/public/NotFound";

import { Routes, Route, Navigate } from "react-router-dom";
import DoctorSchedule from "../pages/doctor/DoctorSchedule";
import DoctorAppointments from "../pages/doctor/DoctorAppointment";
import PatientForgotPassword from "../pages/patient/PatientForgotPassword";
import PatientProfile from "../pages/patient/PatientProfile";
import DoctorForgotPassword from "../pages/doctor/DoctorForgotPassword";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Home />} />
      <Route path="/role" element={<RoleSelection />} />


      {/* ================= PATIENT ================= */}

      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/forgot-password" element={<PatientForgotPassword />} />

      <Route path="/patient/profile" element={<PatientProfile />} />

      <Route
        path="/patient/register"
        element={<PatientRegister />}
      />

      <Route
        path="/patient/dashboard"
        element={<PatientDashboard />}
      />

      <Route
        path="/patient/find-doctor"
        element={<FindDoctor />}
      />

      <Route
        path="/patient/doctor/:id"
        element={<PatientDoctorProfile />}
      />

      <Route
        path="/patient/book/:id"
        element={<BookAppointment />}
      />

      <Route
        path="/patient/appointment-confirmed"
        element={<AppointmentConfirmed />}
      />

      <Route
        path="/patient/appointments"
        element={<PatientAppointments />}
      />


      {/* ================= DOCTOR ================= */}

      <Route
        path="/doctor/login"
        element={<DoctorLogin />}
      />

      <Route
        path="/doctor/forgot-password"
        element={<DoctorForgotPassword />}
      />

      <Route
        path="/doctor/register"
        element={<DoctorRegister />}
      />

      <Route
        path="/doctor/dashboard"
        element={<DoctorDashboard />}
      />

      <Route
        path="/doctor/profile"
        element={<DoctorProfile />}
      />

      <Route
        path="/doctor/schedule"
        element={<DoctorSchedule />}
      />

      <Route
        path="/doctor/appointments"
        element={<DoctorAppointments />}
      />



      {/* ================= 404 ================= */}

      <Route
        path="/404"
        element={<NotFound />}
      />

      <Route
        path="*"
        element={<Navigate to="/404" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;