import { useEffect, useState } from "react";

function History() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <h2>Study History</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Minutes</th>
            <th>Blocked Apps</th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((session, index) => (
            <tr key={index}>
              <td>{session.completedAt}</td>
              <td>{session.minutes}</td>
              <td>{session.blockedApps.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;