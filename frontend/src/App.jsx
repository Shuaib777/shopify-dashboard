import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";

function App() {
  const { user } = useContext(UserContext);
  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage /> : <Dashboard />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <LoginPage />} />
    </Routes>
  );
}

export default App;
