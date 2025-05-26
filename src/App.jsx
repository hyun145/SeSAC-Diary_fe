import { BrowserRouter, Route, Routes, Link, Outlet, useNavigate } from "react-router-dom";
import List from "./diary/List";
import Regist from "./diary/Regist";
import Detail from "./diary/Detail";
import Login from "./user/Login";
import Signup from "./user/SignUp";
import { useEffect, useState } from "react";
import DiaryUpload from "./diary/DiaryUpload"; 

function Layout() {
    const [isLogin, setIsLogin] = useState(false);

    const handleLogout = () => {
        window.sessionStorage.removeItem("access_token");
        setIsLogin(false);
    };

    const navigate = useNavigate();
    
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        if (token) {
            setIsLogin(true);
        } else {
            setIsLogin(false);
        }
    });

    useEffect(() => {
        if(isLogin) {
            navigate("/list");
        } else {
            navigate("/login");
        }
    }, [isLogin]);

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
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/regist" element={<Regist />} />
                        <Route path="/list" element={<List />} />
                        <Route path="/detail/:diary_id" element={<Detail />} />
                        <Route path="/diary/upload" element={<DiaryUpload />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}
export default App;