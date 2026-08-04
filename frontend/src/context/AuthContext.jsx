import { createContext, useContext, useEffect, useState } from 'react';
import API_BASE_URL, { fetchWithAuth } from '../config/api';

const AuthContext = createContext(null);

const EMPTY_DATA = {
  companies: [],
  requirement_types: [],
  users: [],
  students: [],
  staff: [],
  admins: [],
  student_requirements: [],
  applications: [],
  ojt_placements: [],
  attendance: [],
  evaluations: [],
  weekly_reports: [],
  announcements: [],
  notifications: []
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [mockData, setMockData] = useState(EMPTY_DATA);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!currentUser) {
        setMockData(EMPTY_DATA);
        return;
      }

      try {
        const studentId = currentUser?.profile?.student_id;
        const [companiesRes, requirementTypesRes, submissionsRes, applicationsRes, usersRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/companies`),
          fetchWithAuth(`${API_BASE_URL}/requirements/types`),
          fetchWithAuth(`${API_BASE_URL}/requirements/submissions`),
          fetchWithAuth(`${API_BASE_URL}/applications`),
          fetchWithAuth(`${API_BASE_URL}/admin/users`)
        ]);

        const [announcementsRes, notificationsRes, weeklyReportsRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/admin/announcements`),
          fetchWithAuth(`${API_BASE_URL}/admin/notifications?user_id=${currentUser.user_id}`),
          studentId ? fetchWithAuth(`${API_BASE_URL}/student/weekly-reports?student_id=${studentId}`) : Promise.resolve({ ok: true, json: async () => ({ data: [] }) })
        ]);

        const companiesData = companiesRes.ok ? await companiesRes.json() : { data: [] };
        const requirementTypesData = requirementTypesRes.ok ? await requirementTypesRes.json() : { data: [] };
        const submissionsData = submissionsRes.ok ? await submissionsRes.json() : { data: [] };
        const applicationsData = applicationsRes.ok ? await applicationsRes.json() : { data: [] };
        const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
        const announcementsData = announcementsRes.ok ? await announcementsRes.json() : { data: [] };
        const notificationsData = notificationsRes.ok ? await notificationsRes.json() : { data: [] };
        const weeklyReportsData = weeklyReportsRes.ok ? await weeklyReportsRes.json() : { data: [] };

        const users = Array.isArray(usersData.data) ? usersData.data : [];
        const students = users.filter(user => user.role === 'student').map(user => ({
          ...(user.details || {}),
          user_id: user.user_id,
          email: user.email,
          status: user.status,
          account_status: user.status
        }));
        const staff = users.filter(user => user.role === 'staff').map(user => ({
          ...(user.details || {}),
          user_id: user.user_id,
          email: user.email,
          status: user.status,
          account_status: user.status
        }));
        const admins = users.filter(user => user.role === 'admin').map(user => ({
          ...(user.details || {}),
          user_id: user.user_id,
          email: user.email,
          status: user.status,
          account_status: user.status
        }));

        const placementCollections = await Promise.all(
          students
            .filter(student => student.student_id)
            .map(async student => {
              const res = await fetchWithAuth(`${API_BASE_URL}/student/placements?student_id=${student.student_id}`);
              if (!res.ok) return [];
              const payload = await res.json();
              return Array.isArray(payload.data) ? payload.data : [];
            })
        );

        const ojt_placements = placementCollections.flat();
        const placementIds = [...new Set(ojt_placements.map(placement => placement.placement_id).filter(Boolean))];

        const [attendanceCollections, evaluationCollections] = await Promise.all([
          Promise.all(
            placementIds.map(async placementId => {
              const res = await fetchWithAuth(`${API_BASE_URL}/attendance/${placementId}`);
              if (!res.ok) return [];
              const payload = await res.json();
              return Array.isArray(payload.data?.records) ? payload.data.records : [];
            })
          ),
          Promise.all(
            placementIds.map(async placementId => {
              const res = await fetchWithAuth(`${API_BASE_URL}/evaluations/${placementId}`);
              if (!res.ok) return [];
              const payload = await res.json();
              return Array.isArray(payload.data) ? payload.data : [];
            })
          )
        ]);

        if (cancelled) return;

        setMockData({
          companies: Array.isArray(companiesData.data) ? companiesData.data : [],
          requirement_types: Array.isArray(requirementTypesData.data) ? requirementTypesData.data : [],
          users,
          students,
          staff,
          admins,
          student_requirements: Array.isArray(submissionsData.data) ? submissionsData.data : [],
          applications: Array.isArray(applicationsData.data) ? applicationsData.data : [],
          ojt_placements,
          attendance: attendanceCollections.flat(),
          evaluations: evaluationCollections.flat(),
          weekly_reports: Array.isArray(weeklyReportsData.data) ? weeklyReportsData.data : [],
          announcements: Array.isArray(announcementsData.data) ? announcementsData.data : [],
          notifications: Array.isArray(notificationsData.data) ? notificationsData.data : []
        });
      } catch (error) {
        if (!cancelled) {
          setMockData(EMPTY_DATA);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const login = async (role, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      if (data.success) {
        if (data.user.requires_password_change) {
          return { success: true, requires_password_change: true, user_id: data.user.user_id };
        }
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, message: "Unable to reach the server. Please try again later." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  const updateCurrentUser = (user) => setCurrentUser(user);

  return (
    <AuthContext.Provider value={{ currentUser, mockData, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);