import { BrowserRouter, Route, Routes, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import List from "./diary/List";
import Regist from "./diary/Regist";
import Detail from "./diary/Detail";
import Login from "./user/Login";
import { useEffect, useState, useRef } from "react";
import DiaryUpload from "./diary/DiaryUpload";
import OauthHandler from "./user/OauthHandler";
import UserRegForm from "./user/UserRegForm.jsx";
import ModifyDetail from "./diary/ModifyDetail.jsx";

import CallbackPage from './oauth/CallbackPage';

import CalendarComponent from "./calendar";                         //캘린더

function Layout() {
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const alertShownRef = useRef(false); // alert이 방금 출력되었는지 추적하는 useRef

    const handleLogout = () => {
        window.sessionStorage.removeItem("access_token");
        setIsLogin(false);
        alertShownRef.current = false; // 로그아웃 시 alert 상태 초기화
        navigate("/login");
    };


    // isLogin 상태를 관리하는 useEffect (path 변경 시 토큰 재확인)
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        setIsLogin(!!token); // 토큰이 있으면 true, 없으면 false
    }, [location.pathname]);

    // useEffect(() => {
    //     if (isLogin) {
    //         navigate("/list");
    //     } else {
    //         navigate("/login");
    //     }
    // }, [isLogin]);

    // 로그인 여부에 따른 리다이렉트 로직
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        const currentPath = location.pathname;

        // 구글 OAuth 처리 중이거나, alert이 이미 출력된 상태면 추가 로직 건너뛰기
        if (currentPath === "/oauth") { // 구글 OAuth 처리 중일 때는 alert/navigate를 막음
            return;
        }
        if (alertShownRef.current) {
            alertShownRef.current = false;
            return;
        }

        // 로그인 상태일 때, 로그인/회원가입 페이지에 접근 시 리스트 페이지로 강제 이동
        if (token) { // 로그인 상태
            if (currentPath === "/login" || currentPath === "/userregform") {
                alert("이미 로그인되어 있습니다. 일기 목록 페이지로 이동합니다.");
                alertShownRef.current = true;
                navigate("/list");
            }
        }
        // 로그인 상태가 아닐 때, 특정 페이지(리스트, 등록, 상세 등) 접근 시 로그인 페이지로 강제 이동
        else { // 로그아웃 상태
            // 로그인, 회원가입 페이지는 예외 (루트 경로도 로그인 없어도 허용)
            const allowedPathsWithoutLogin = ["/login", "/userregform", "/"];
            if (!allowedPathsWithoutLogin.includes(currentPath)) {
                alert("로그인 후 사용하세요.");
                alertShownRef.current = true;
                navigate("/login");
            }
        }
    }, [isLogin, navigate, location.pathname]); // isLogin, navigate, location.pathname이 변경될 때마다 실행

    return (
        <>
            <h1>새싹 일기장</h1>
            <hr />
            <header>
                {
                    isLogin ? (
                        <a onClick={handleLogout}>로그아웃</a>
                    ) : (
                        <Link to="/login">로그인</Link>
                    )
                }
            </header>
            <main>
                <Outlet />
            </main>
            <footer>
                <p>새싹 일기장 © 2025</p>
            </footer>
        </>
    );
}

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<List />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/userregform" element={<UserRegForm />} />
                        <Route path="/regist" element={<Regist />} />
                        <Route path="/list" element={<List />} />
                        <Route path="/detail/:diary_id" element={<Detail />} />
                        <Route path="/diary/upload" element={<DiaryUpload />} />
                        <Route path="/oauth" element={<OauthHandler />} />
                        <Route path="/userregform" element={<UserRegForm />} />
                        <Route path="/modifydetail/:diary_id" element={<ModifyDetail />} />
                        <Route path="/oauth/callback" element={<CallbackPage />} />
                        <Route path="/calendar" element={<CalendarComponent />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}
export default App;