import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "./store/useUserStore";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setUser, setIsFetching } = useUserStore();

  const getUser = async () => {
    try {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          if (user || location.pathname === "/register") {
            setUser(user);
            resolve(user);
            // navigate("/");
          } else {
            navigate("/login");
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const { isFetching } = useQuery(["user"], getUser, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching]);

  return (
    <div className="flex items-center h-screen max-h-full">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default WrappedApp;
