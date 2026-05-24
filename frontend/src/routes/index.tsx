import { createBrowserRouter } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { Home } from '../pages/Home';
import { MyQuizzes } from '../pages/MyQuizzes';
import { PublicQuizList } from '../pages/PublicQuizList';
import { Question } from '../pages/Question';
import { Quizzes } from '../pages/Quizzes';
import { Ranking } from '../pages/Ranking';
import { Responses } from '../pages/Responses';
import { Reports } from '../pages/Reports';
import { QuizReport } from '../pages/QuizReport';

import { SessionStyleProvider, useSessionStyle } from '../contexts/SessionStyleContext';
import { ThemeProvider } from '@mui/material';
import PrivateRoute from './PrivateRoute';

import { HostLobby } from '../components/HostLobby';
import { PlayerLobby } from '../components/PlayerLobby';
import { SessionQuestion } from '../pages/SessionQuestion';
import { SessionRanking } from '../pages/SessionRanking';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { muiTheme } = useSessionStyle();
    return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}


const routes = createBrowserRouter([
    {
        path: '/',
        element: <PublicQuizList />,
    },
    {
        path: '/:accessIdentifier',
        element:
            <SessionStyleProvider>
                <ThemeWrapper>
                    <Home />
                </ThemeWrapper>
            </SessionStyleProvider>
    },
    {
        path: '/question/:accessIdentifier',
        element: (
            <PageWrapper>
                <Question />
            </PageWrapper>
        ),
    },
    {
        path: '/ranking',
        element: <Ranking />,
    },
    {
        path: '/admin',
        element: (
            <PrivateRoute>
                <MyQuizzes />
            </PrivateRoute>
        ),
    },
    {
        path: '/responses',
        element: (
            <PrivateRoute>
                <Responses />
            </PrivateRoute>
        ),
    },
    {
        path: '/quizzes',
        element: (
            <PrivateRoute>
                <Quizzes />
            </PrivateRoute>
        ),
    },
    {
        path: '/reports',
        element: (
            <PrivateRoute>
                <Reports />
            </PrivateRoute>
        ),
    },
    {
        path: '/quiz-report/:quizId',
        element: (
            <PrivateRoute>
                <QuizReport />
            </PrivateRoute>
        ),
    },
    {
        path: '/host/:sessionId',
        element: (
            <SessionStyleProvider>
                <ThemeWrapper>
                    <PrivateRoute>
                        <HostLobby />
                    </PrivateRoute>
                </ThemeWrapper>
            </SessionStyleProvider>
        ),
    },
    {
        path: '/session/:sessionId',
        element: (
            <SessionStyleProvider>
                <ThemeWrapper>
                    <PlayerLobby />
                </ThemeWrapper>
            </SessionStyleProvider>
        )
    },
    {
        path: '/:sessionId/question-session',
        element: (

            <SessionStyleProvider>
                <ThemeWrapper>
                    <SessionQuestion />
                </ThemeWrapper>
            </SessionStyleProvider>
        )
    },
    {
        path: '/:sessionId/session-ranking',
        element: (

            <SessionStyleProvider>
                <ThemeWrapper>
                    <SessionRanking />
                </ThemeWrapper>
            </SessionStyleProvider>
        )
    }
]);

export default routes;
