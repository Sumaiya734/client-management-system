import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav className="flex flex-col gap-2">
        <NavLink to="/" className="hover:bg-gray-700 p-2 rounded">Dashboard</NavLink>
        <NavLink to="/clients" className="hover:bg-gray-700 p-2 rounded">Clients</NavLink>
        <NavLink to="/reports" className="hover:bg-gray-700 p-2 rounded">Reports</NavLink>
      </nav>
    </aside>
  );
}
