import React, { useEffect, useState, useMemo, Suspense } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";
import API from '../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <h1>เกิดข้อผิดพลาดในระบบ</h1>;
    return this.props.children;
  }
}

const StatsCard = React.lazy(() => Promise.resolve({
  default: React.memo(({ title, data }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.card}
    >
      <h3>{title}</h3>
      <p>{data}</p>
    </motion.div>
  ))
}));

const Admin = () => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [status, setStatus] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [loginCount, setLoginCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [chartData, setChartData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/booking_logs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Bookings fetch failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Bookings error:", err.message);
      setError("ไม่สามารถโหลดข้อมูลการจองได้");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API}/admin/stats`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Stats fetch failed with status: ${response.status}`);
      
      const data = await response.json();
      setTotalUsers(data.totalUsers || 0);
      setLoginCount(data.loginCount || 0);
      
      setChartData({
        labels: ["ผู้ใช้ทั้งหมด", "จํานวนการเข้าใช้"],
        datasets: [{
          label: "สถิติระบบ",
          data: [data.totalUsers || 0, data.loginCount || 0],
          backgroundColor: ["#3498db", "#2ecc71"],
        }],
      });
    } catch (err) {
      console.error("Stats error:", err.message);
      setError("ไม่สามารถโหลดข้อมูลสถิติได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoggedInUser("Admin");
    setStatus("ออนไลน์");

    fetchStats();
    fetchBookings();
    const interval = setInterval(() => {
      fetchStats();
      fetchBookings();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    fetchStats();
  };

  const themeStyles = useMemo(() => ({
    light: { background: "#f5f5f5", color: "#2c3e50" },
    dark: { background: "#2c3e50", color: "#ecf0f1" },
  }), []);

  if (loading) return <div style={styles.container}>กำลังโหลด...</div>;

  return (
    <ErrorBoundary>
      <div style={{ ...styles.container, ...themeStyles[theme] }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>แดชบอร์ดแอดมิน</h1>
          <div>
            <input
              style={styles.searchInput}
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              style={styles.themeButton}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button
              style={styles.refreshButton}
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "รีเฟรช"}
            </button>
          </div>
        </header>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <main style={styles.main}>
          <div style={styles.grid}>
            <Suspense fallback={<div>กำลังโหลด...</div>}>
              <StatsCard title="ข้อมูลผู้ใช้" data={`ชื่อ: ${loggedInUser}`} />
              <StatsCard title="สถานะ" data={<span style={styles.statusOnline}>{status}</span>} />
            </Suspense>

            <div style={styles.card}>
              <h3>ภาพรวมสถิติ</h3>
              <div style={{ height: "200px" }}>
                <Bar
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } },
                  }}
                />
              </div>
            </div>
            <div style={styles.card}>
      <h3>ประวัติการจอง</h3>
      {bookings.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ห้อง</th>
              <th>ผู้จอง</th>
              <th>เริ่ม</th>
              <th>สิ้นสุด</th>
            </tr>
          </thead>
          <tbody>
          {bookings.map((log) => {
  const startTime = log.bookingId?.startTime || log.details?.startTime 
    ? new Date(log.bookingId?.startTime || log.details?.startTime) 
    : null;
  const endTime = log.bookingId?.endTime || log.details?.endTime 
    ? new Date(log.bookingId?.endTime || log.details?.endTime) 
    : null;
  const timestamp = log.timestamp ? new Date(log.timestamp) : null;
  return (
    <tr key={log._id}>
      <td>{log.bookingId?.room || log.details?.room || "ไม่ระบุ"}</td>
      <td>{log.userId?.fullName || "ไม่ระบุ"}</td>
      <td>{startTime && !isNaN(startTime) ? startTime.toLocaleString("th-TH") : "ไม่ระบุ"}</td>
      <td>{endTime && !isNaN(endTime) ? endTime.toLocaleString("th-TH") : "ไม่ระบุ"}</td>
      <td>{log.action || "ไม่ระบุ"}</td>
      <td>{timestamp && !isNaN(timestamp) ? timestamp.toLocaleString("th-TH") : "ไม่ระบุ"}</td>
    </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>ยังไม่มีประวัติการจอง</p>
  )}
</div>
          </div>
        </main>

        <footer style={styles.footer}>
          <p>อัพเดทล่าสุด: {new Date().toLocaleString("th-TH")}</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

const styles = {
  container: {
    fontFamily: "'Kanit', Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
  },
  header: {
    padding: "20px",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { margin: 0, fontSize: "24px" },
  searchInput: {
    padding: "8px",
    marginRight: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  themeButton: {
    padding: "8px 16px",
    marginRight: "10px",
    backgroundColor: "#7f8c8d",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
  refreshButton: {
    padding: "8px 16px",
    backgroundColor: "#3498db",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
  main: { padding: "20px 0" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  statusOnline: { color: "#27ae60", fontWeight: "bold" },
  errorAlert: {
    backgroundColor: "#ffebee",
    color: "#c0392b",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
  },
  footer: { marginTop: "20px", fontSize: "14px" },
};

export default Admin;