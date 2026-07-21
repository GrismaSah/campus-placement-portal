import { useContext, useEffect, Suspense, lazy } from "react";
import "./App.css";

import { Context } from "./main";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import LoaderPage from "./components/Loader/LoaderPage.jsx";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
const ForgotPassword = lazy(() => import("./components/Forgot/ForgotPassword.jsx"));

const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const Home = lazy(() => import("./components/Home/Home"));
const Jobs = lazy(() => import("./components/Job/Jobs"));
const JobDetails = lazy(() => import("./components/Job/JobDetails"));
const Application = lazy(() => import("./components/Application/Application"));
const MyApplications = lazy(() =>
  import("./components/Application/MyApplications")
);
const PostJob = lazy(() => import("./components/Job/PostJob"));
const NotFound = lazy(() => import("./components/NotFound/NotFound"));
const MyJobs = lazy(() => import("./components/Job/MyJobs"));
const JobApplications = lazy(() =>
  import("./components/Application/JobApplications")
);
const TPOLogin = lazy(() => import("./components/TPO/Login"));
const TPORegister = lazy(() => import("./components/TPO/Register"));
const Profile = lazy(() => import("./components/Profile/Profile.jsx"));
const TPODashboard = lazy(() => import("./components/TPO/Dashboard.jsx"));


axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
axios.defaults.withCredentials = true;

const App = () => {
  const { isAuthorized, setIsAuthorized, setUser, user, setAuthLoading } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );

        const user = response.data.user;
        setUser(user);
        // console.log('user', response.data);
        if(user === null){
          const response = await axios.get("/api/v1/tpo/me", {
            withCredentials: true,
          });
          setUser(response.data.user);
        }
        
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, [isAuthorized]);

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<LoaderPage />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/job/getall"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application/:id"
              element={
                <ProtectedRoute roles={["Student"]}>
                  <Application />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/me"
              element={
                <ProtectedRoute roles={["Student", "TNP"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:jobId"
              element={
                <ProtectedRoute roles={["TNP"]}>
                  <JobApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/post"
              element={
                <ProtectedRoute roles={["TNP"]}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/me"
              element={
                <ProtectedRoute roles={["TNP"]}>
                  <MyJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["Student", "TNP"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/tpo/login" element={<TPOLogin />} />
            <Route
              path="/tpo/dashboard"
              element={
                <ProtectedRoute roles={["TPO"]}>
                  <TPODashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/tpo/register" element={<TPORegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Suspense>
        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;