import { useState, useCallback } from "react";
import { B, INITIAL_STUDENTS, INITIAL_PAYMENTS, PROFE_PIN, genId } from "./tokens-data.js";
import { PinPad, NotificationBell } from "./components.jsx";
import AdminMode from "./admin.jsx";
import StudentMode from "./student.jsx";

/* ══════════════════════════════════════════════════════════════
   App.jsx — Orquestador principal
   Academia LR
══════════════════════════════════════════════════════════════ */

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [payments] = useState(INITIAL_PAYMENTS);
  const [mode, setMode] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleLogin = (pin) => {
    if (pin === PROFE_PIN) {
      setMode("admin");
      return true;
    }
    const found = students.find(s => s.pin === pin);
    if (found) {
      setCurrentStudentId(found.id);
      setMode("student");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setMode(null);
    setCurrentStudentId(null);
    setLoginError("");
  };

  const updateStudent = (id, updater) => {
    setStudents(prev => prev.map(s => s.id === id ? updater(s) : s));
  };

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [...prev, notif]);
  }, []);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const currentStudent = students.find(s => s.id === currentStudentId) || null;

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${B.bg};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${B.bgDark};}
        ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px;}
        input::placeholder{color:${B.textMuted};}
        button:focus{outline:none;}
        select:focus{outline:none;}
      `}</style>

      {mode === null && (
        <PinPad onSubmit={handleLogin} error={loginError} setError={setLoginError} />
      )}

      {mode === "admin" && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "fixed", top: 12, right: 20, zIndex: 300 }}>
            <NotificationBell
              notifications={notifications.filter(n => n.para === "profe" || n.para === "todos")}
              onMarkRead={markNotificationRead}
              onClearAll={clearAllNotifications}
            />
          </div>
          <AdminMode
            students={students}
            payments={payments}
            onUpdate={updateStudent}
            onAddNotification={addNotification}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onClearAll={clearAllNotifications}
            onLogout={handleLogout}
          />
        </div>
      )}

      {mode === "student" && currentStudent && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "fixed", top: 12, right: 20, zIndex: 300 }}>
            <NotificationBell
              notifications={notifications.filter(n => n.para === "alumno" && n.alumnoId === currentStudent.id)}
              onMarkRead={markNotificationRead}
              onClearAll={clearAllNotifications}
            />
          </div>
          <StudentMode
            student={currentStudent}
            onLogout={handleLogout}
            onUpdate={updateStudent}
            onAddNotification={addNotification}
          />
        </div>
      )}
    </>
  );
}
