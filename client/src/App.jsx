import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import AppLayout from "./components/AppLayout";
// import PageNotFound from "./pages/PageNotFound";
// import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";

function App() {
  // const { auth } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* <Route
            path="/products"
            element={auth ? <Products /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={auth ? <Navigate to="/" /> : <Signup />}
          />
          <Route
            path="/login"
            element={auth ? <Navigate to="/" /> : <Login />}
          /> */}
        {/* <Route path="*" element={<PageNotFound />} /> */}
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
