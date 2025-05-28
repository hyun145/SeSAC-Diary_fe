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

import CalendarComponent from "./calendar";

function Layout() {
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const alertShownRef = useRef(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        window.sessionStorage.removeItem("access_token");
        window.sessionStorage.removeItem("user_id"); // user_id도 함께 삭제
        setIsLogin(false);
        alertShownRef.current = false;
        setIsMenuOpen(false); // 로그아웃 시 메뉴 닫기
        navigate("/login");
    };

    // isLogin 상태를 관리하는 useEffect (path 변경 시 토큰 재확인)
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        setIsLogin(!!token); // 토큰이 있으면 true, 없으면 false
    }, [location.pathname]);

    // 로그인 여부에 따른 리다이렉트 로직
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        const currentPath = location.pathname;

        if (currentPath === "/oauth") {
            return;
        }
        if (alertShownRef.current) {
            alertShownRef.current = false;
            return;
        }

        if (token) { // 로그인 상태
            if (currentPath === "/login" || currentPath === "/userregform") {
                alert("이미 로그인되어 있습니다. 일기 목록 페이지로 이동합니다.");
                alertShownRef.current = true;
                navigate("/list");
            }
        }
        // 로그인 상태가 아닐 때, 특정 페이지(리스트, 등록, 상세 등) 접근 시 로그인 페이지로 강제 이동
        else { // 로그아웃 상태
            const allowedPathsWithoutLogin = ["/login", "/userregform", "/"];
            if (!allowedPathsWithoutLogin.includes(currentPath)) {
                alert("로그인 후 사용하세요.");
                alertShownRef.current = true;
                navigate("/login");
            }
        }
    }, [isLogin, navigate, location.pathname]);

    // 메뉴 토글 함수
    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    // 메뉴 외부 클릭 감지 (메뉴 닫기)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                borderBottom: '1px solid #eee'
            }}>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: '1.5em', 
                    color: '#009434',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}>SeSAC_Diary</h1>
                
                {/* 메뉴 버튼 */}
                <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#333',
                            padding: '5px'
                        }}
                    >
                        &#8942; {/* 유니코드 점점점 (vertical ellipsis) */}
                    </button>
                    {isMenuOpen && ( // isMenuOpen이 true일 때만 드롭다운 메뉴 렌더링
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #333',
                            borderRadius: '5px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            minWidth: '120px',
                            zIndex: 1000
                        }}>
                            {/* isLogin 상태에 따라 로그아웃 또는 로그인 버튼을 조건부 렌더링 */}
                            {isLogin ? ( // 로그인 상태일 때
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        padding: '8px 10px',
                                        border: 'none',
                                        background: 'none',
                                        color: 'black',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '1em',
                                        whiteSpace: 'nowrap',
                                        width: '100%' // 버튼 너비 100%로 설정
                                    }}
                                >
                                    로그아웃
                                </button>
                            ) : ( // 로그아웃 상태일 때
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)} // 로그인 버튼 클릭 시 메뉴 닫기
                                    style={{
                                        padding: '8px 10px',
                                        textDecoration: 'none',
                                        color: 'black',
                                        display: 'block', // Link도 블록 요소처럼 보이도록
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    로그인
                                </Link>
                            )}
                            {/* 필요한 경우 여기에 다른 메뉴 항목을 추가할 수 있습니다. */}
                        </div>
                    )}
                </div>
            </div>

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
                    <Route path="/calendar" element={<CalendarComponent />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;