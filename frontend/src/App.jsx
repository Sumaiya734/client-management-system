import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/test")
      .then(res => setStatus(res.data.status))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Client Management System</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
