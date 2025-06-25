import axios from "axios";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const inputRef = useRef();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const changeUsername = e => setUsername(e.target.value);
    const changePassword = e => setPassword(e.target.value);
    const handleSubmit = e => {
        e.preventDefault();

        axios
            .post("/api/users/signin",
                { username, password },
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
            .then(res => {
                console.log(res);
                if (res.status === 200) {
                    // 메시지를 출력 -> 토큰을 저장 -> 일기장 목록으로 이동
                    alert("배포 자동화 테스트.")
                    alert(res.data.message);

                    const accessToken = res.data.access_token; 

                    window.sessionStorage.setItem("access_token", res.data.access_token);

                    // --- 핵심 추가 부분: user_id를 JWT 토큰에서 디코딩하여 저장 ---
                    try {
                        // JWT 토큰은 세 부분으로 나뉩니다: 헤더.페이로드.서명
                        const base64Url = accessToken.split('.')[1]; // 페이로드 부분
                        // Base64 URL 안전 문자열을 일반 Base64 문자열로 변환
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        // Base64 디코딩 후 JSON 파싱
                        const decodedPayload = JSON.parse(window.atob(base64));

                        // 'sub' 클레임에 사용자 ID가 저장되어 있다고 가정
                        if (decodedPayload && decodedPayload.user_id) {
                            window.sessionStorage.setItem("user_id", String(decodedPayload.user_id));
                            console.log("Logged in user ID saved:", decodedPayload.user_id);
                        } else {
                            console.warn("JWT 페이로드에 'user_id' 클레임이 없습니다. 수정 버튼이 보이지 않을 수 있습니다.");
                        }
                    } catch (decodeError) {
                        console.error("JWT 토큰 디코딩 중 오류 발생:", decodeError);
                        // 오류 발생 시 user_id는 저장되지 않으므로, 수정 버튼이 나타나지 않을 수 있습니다.
                    }
                    // -------------------------------------------------------------

                    navigate("/list");  // 로그인 성공 시 일기장 목록으로 이동
                }
            })
            .catch(err => {
                console.log(err);
                if (err.status === 401 || err.status === 404) {
                    alert("로그인에 실패했습니다.\n" + err.response.data.detail);
                } else {
                    alert("로그인에 실패했습니다.");
                }
                setUsername('');
                setPassword('');
                inputRef.current.focus();
            });
    };

     // 구글 로그인 버튼 클릭 시 백엔드로 이동
     const handleGoogleLogin = () => {
         window.location.href = "/api/users/google/login";
     };

    return (
        <>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input ref={inputRef} type="text" value={username} onChange={changeUsername} placeholder="이메일을 입력하세요." />
                <input type="password" value={password} onChange={changePassword} placeholder="패스워드를 입력하세요." />
                <button type="submit">로그인</button>
            </form>
            <hr />
            <button onClick={handleGoogleLogin} style={{ background: "#4285F4", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "4px", marginTop: "10px" }}>
                Google 계정으로 로그인
            </button>
            <hr />
            <p style={{ marginTop: "20px" }}>
                아직 계정이 없으신가요?
                <Link to="/userregform" style={{ marginLeft: "10px", color: "#007bff", textDecoration: "none" }}>회원가입</Link>
            </p>
        </>
    );
}