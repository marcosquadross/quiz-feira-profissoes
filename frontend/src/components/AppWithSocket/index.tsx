import { RouterProvider } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import { SocketProvider } from "../../contexts/SocketContext";
import { SessionSocketProvider } from "../../contexts/SessionSocketContext";
import routes from "../../routes";

export const AppWithSocket = () => {
    // const { userId, token } = useAuth();

    return (
        // <SocketProvider token={token || ""} userId={userId || ""}>
        <SessionSocketProvider>
            <div className="App">
                <RouterProvider router={routes} />
            </div>
        </SessionSocketProvider>
        // </SocketProvider>
    );
};
