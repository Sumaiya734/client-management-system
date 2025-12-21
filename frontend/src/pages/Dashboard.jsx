export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded shadow">Total Clients: 0</div>
        <div className="bg-green-500 text-white p-4 rounded shadow">Total Invoices: 0</div>
        <div className="bg-yellow-500 text-white p-4 rounded shadow">Payments: 0</div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Recent Activity</h3>
        <div className="bg-white p-4 rounded shadow">Activity feed placeholder</div>
      </div>
    </div>
  );
}
