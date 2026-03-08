import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import History from "./pages/History";

const routes = [
  { path: "/", element: <Dashboard />, title: "Overview of crop prices" },
  {
    path: "/predictions",
    element: <Predictions />,
    title: "Predict crop prices",
  },
  { path: "/analytics", element: <Analytics />, title: "Analyze price trends" },
  { path: "/history", element: <History />, title: "Historical price data" },
];

function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {routes.map(({ path, element, title }) => (
            <Route
              key={path}
              path={path}
              element={<Layout title={title}>{element}</Layout>}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
