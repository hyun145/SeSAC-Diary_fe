import axios from "axios";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const inputRef = useRef();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const changeUsername = e => setUsername(e.target.value);
    const changePassword = e => setPassword(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();

        // ✅ OAuth2PasswordRequestForm 방식으로 전송할 FormData 생성
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        axios
            .post("http://localhost:8000/api/users/signin", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then(res => {
                console.log(res);
                if (res.status === 200) {
                    alert(res.data.message);
                    window.sessionStorage.setItem("access_token", res.data.access_token);
                    navigate("/list");
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.detail) {
                    alert("로그인 실패: " + err.response.data.detail);
                } else {
                    alert("로그인에 실패했습니다.");
                }
                setUsername('');
                setPassword('');
                inputRef.current.focus();
            });
    };

    const goToSignup = () => {
        navigate("/signup");
    };

    return (
        <>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={changeUsername}
                    placeholder="이메일을 입력하세요."
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={changePassword}
                    placeholder="패스워드를 입력하세요."
                    required
                />
                <button type="submit">로그인</button>
            </form>
            <button onClick={goToSignup} style={{ marginTop: '10px' }}>
                회원가입 하러 가기
            </button>
        </>
    );
}
