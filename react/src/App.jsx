import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import verifyJWT from "./utils/VerifyJWT.js";
import {useScrollFix} from "./utils/useScrollFix.js";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import OauthSuccess from "./auth/OauthSuccess.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import RegisterPage from "./auth/RegisterPage.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Logout from "./auth/Logout.jsx";
import LaundryRoutes from "./routes/LaundryRoutes.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import CustomerRoutes from "./routes/CustomerRoutes.jsx";
import DeliveryRoutes from "./routes/DeliveryRoutes.jsx";
import 'leaflet/dist/leaflet.css';
import HomePage from "./pages/HomePage.jsx";
import Toast from "./utils/Toast.jsx";
import {useState} from "react";
import {initialToastState} from "./utils/utility.js";

function App() {
    const [toast, setToast] = useState(initialToastState);
    const [loading, setLoading] = useState(false);

    verifyJWT();
    useScrollFix();

    return (
        <div>
            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />}
            {loading && <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>}
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage setLoading={setLoading} setToast={setToast} />} />
                    <Route path="/login" element={<LoginPage setToast={setToast} />} />
                    <Route path="/register" element={<RegisterPage setToast={setToast}/>} />
                    <Route path="/oauth-success" element={<OauthSuccess setToast={setToast}/>} />
                    <Route path="/forgot-password" element={<ForgotPassword setToast={setToast}/>} />
                    <Route path="/reset-password" element={<ResetPassword setToast={setToast} setLoad={setLoading}/>} />
                    <Route
                        path="/laundry/*"
                        element={
                            <PrivateRoute roles={['LAUNDRY']}>
                                <LaundryRoutes setLoading={setLoading} setToast={setToast} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/laundry-adda/admin/*"
                        element={
                            <PrivateRoute roles={['ADMIN']}>
                                <AdminRoutes setLoading={setLoading} setToast={setToast} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/customer/*"
                        element={
                            <PrivateRoute roles={['CUSTOMER']}>
                                <CustomerRoutes setLoading={setLoading} setToast={setToast} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/delivery/*"
                        element={
                            <PrivateRoute roles={['DELIVERY']}>
                                <DeliveryRoutes setLoading={setLoading} setToast={setToast} />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/logout" element={<Logout/>} />
                    <Route path="/not-found" element={<NotFound />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App
