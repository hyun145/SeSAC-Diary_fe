import axios from "axios";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [hobby, setHobby] = useState('');

  const changeEmail = (e) => setEmail(e.target.value);
  const changePassword = (e) => setPassword(e.target.value);
  const changeUsername = (e) => setUsername(e.target.value);
  const changeHobby = (e) => setHobby(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      email,
      password,
      username,
      hobby,
      role: "user", // 고정값
    };

    axios
      .post(
        "http://localhost:8000/api/users/signup",
        data,
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        console.log(res);
        if (res.status === 201 || res.status === 200) {
          alert("회원가입 성공! 로그인 페이지로 이동합니다.");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.data && err.response.data.detail) {
          alert("회원가입 실패: " + err.response.data.detail);
        } else {
          alert("회원가입에 실패했습니다.");
        }
        setEmail('');
        setPassword('');
        setUsername('');
        setHobby('');
        inputRef.current.focus();
      });
  };

  return (
    <>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={changeEmail}
          placeholder="이메일을 입력하세요."
          required
        />
        <input
          type="password"
          value={password}
          onChange={changePassword}
          placeholder="비밀번호를 입력하세요."
          required
        />
        <input
          type="text"
          value={username}
          onChange={changeUsername}
          placeholder="사용자명을 입력하세요."
          required
        />
        <input
          type="text"
          value={hobby}
          onChange={changeHobby}
          placeholder="취미를 입력하세요."
        />
        <button type="submit" style={{ marginTop: '10px' }}>
          회원가입
        </button>
      </form>
    </>
  );
}
