import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ActivityLogs from "./pages/ActivityLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
