import { BrowserRouter,Route,Routes } from "react-router-dom";
import Login from "./Login";
import Folder from "./Folder";
import Dashboard from "./Dashboard";
import SearchUsers from "./SearchUsers";
import ConnectionsPage from "./ConnectionsPage";
function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Login/>} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/folder/:folderId" element={<Folder />} />
    <Route path="/searchusers" element={<SearchUsers/>} />
    <Route path="/connections" element={<ConnectionsPage />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
