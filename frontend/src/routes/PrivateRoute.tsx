import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

const PrivateRoute = ({ children }: { children: ReactElement }) => {
    const auth = localStorage.getItem("accessToken");
    return auth ? children : <Navigate to="/" />;
};

export default PrivateRoute;