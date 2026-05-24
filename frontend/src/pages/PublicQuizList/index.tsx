import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../../components/Header";
import { QuizList } from "../../components/QuizList";
import { GoogleButton } from "../../components/GoogleLoginButton";

export function PublicQuizList() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("accessToken") !== null;

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/admin");
        }
    }, [isLoggedIn, navigate]);

    return (
        <>
            <Header rightContent={<GoogleButton />} />
            <QuizList />
        </>
    );
}
