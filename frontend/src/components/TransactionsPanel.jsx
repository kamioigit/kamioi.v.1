import React, { useEffect, useState } from "react";
import { UserAPI } from "../services/apiService";
import { useAuth } from "../context/AuthContext";

export default function TransactionsPanel() {
  const { loginUser, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchTx() {
    setLoading(true); setErr("");
    try {
      const { data } = await UserAPI.transactions();
      setRows(data.transactions || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
    } finally { setLoading(false); }
  }

  useEffect(() => { if (user) fetchTx(); }, [user]);

  return (
    <div style={{padding:16, fontFamily:"system-ui"}}>
      <h2>Transactions (User)</h2>
      {!user && (
        <div style={{margin:"12px 0"}}>
          <button onClick={() => loginUser("user5@user5.com","user123")}>
            Quick Login as user5
          </button>
        </div>
      )}
      <div style={{margin:"12px 0"}}>
        <button onClick={fetchTx} disabled={loading}>Refresh</button>
      </div>
      {loading && <div>Loading�</div>}
      {err && <div style={{color:"crimson"}}>{err}</div>}
      <table border="1" cellPadding="6" style={{marginTop:8, width:"100%", maxWidth:720}}>
        <thead>
          <tr><th>ID</th><th>Merchant</th><th>Amount</th><th>Date</th><th>Created</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i}>
              <td>{r.id ?? "-"}</td>
              <td>{r.merchant ?? "-"}</td>
              <td>{r.amount ?? "-"}</td>
              <td>{r.date ?? "-"}</td>
              <td>{r.created_at ?? "-"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="5">No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
