import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import SearchBar from "./components/form/input/SearchBar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserManagementPage from "./pages/UserManagement/UserManagementPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CreateProjectPage from "./components/CreateProjectPage";
import BookUpload from "./components/BookUpload";
import CollectionCreate from "./components/Collections/CreateCollections";
import CollectionManager from "./components/Collections/CollectionManager";
import ProjectPage from "./components/Projects/ProjectPage";
import ProjectCollections from "./components/Collections/ProjectCollections";
import AllCollections from "./components/Collections/AllCollections";
import CollectionDetails from "./components/Collections/CollectionDetails";
import ProjectBooks from "./components/Books/ProjectBooks";
import AllBooks from "./components/Books/AllBooks";
import CollectionBooks from "./components/Books/CollectionBooks";
import ProjectMembers from "./components/Members/ProjectMembers";
import AllMembers from "./components/Members/AllMembers";
import ChatbotPage from "./components/Tools/Chatbot";
import ToolsPage from "./components/Tools/ToolsPage";
import ToolsWelcomePage from "./components/Tools/ToolsWelcomePage";
import BookUploadManager from "./components/Books/BookUploadManager";
import { AuthProvider } from "./context/AuthProvider";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route index path="/" element={<SignIn />} />
          <Route
            path="/:projectId/chatbot"
            element={<ChatbotPage projectId={":id"} />}
          />
          <Route
            path="/:projectId/welcome"
            element={<ToolsPage projectId={":id"} />}
          />
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard/projects/create" element={<CreateProjectPage />} />
            <Route path="/collections/create" element={<CollectionCreate />} /> {/* New route */}
            <Route path="/collections/create/:id" element={<CollectionCreate />} />
            <Route
              path="/dashboard/collections"
              element={
                <ProtectedRoute allowedRoles={["project_manager", "book_manager"]}>
                  <AllCollections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections/:collectionId"
              element={
                <ProtectedRoute allowedRoles={["project_manager", "book_manager"]}>
                  <CollectionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/manage"
              element={
                <ProtectedRoute allowedRoles={["book_manager"]}>
                  <BookUploadManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/upload"
              element={
                <ProtectedRoute allowedRoles={["book_manager"]}>
                  <BookUpload />
                </ProtectedRoute>
              }
            />
            <Route path="/project/:id" element={<ProjectPage />}>
              <Route
                path="collections/add"
                element={<div><ProjectCollections projectId={":id"} /><AllCollections /></div>}
              />
              <Route
                path="books/add"
                element={<div><ProjectBooks projectId={":id"} /><AllBooks /></div>}
              />
              <Route
                path="members/add"
                element={<div><ProjectMembers projectId={":id"} /><AllMembers /></div>}
              />
              <Route path="tools/welcome" element={<ToolsWelcomePage />} />
              <Route path="chatbot/welcome" element={<ToolsWelcomePage />} />
            </Route>
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="SearchBar" element={<SearchBar />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

// gaurav