import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token'); // 백엔드에서 'access_token'으로 보냄
    const userId = params.get('user_id');       // 백엔드에서 'user_id'로 보냄

    if (accessToken && userId) {
      // 토큰과 user_id를 sessionStorage에 저장
      window.sessionStorage.setItem("access_token", accessToken);
      window.sessionStorage.setItem("user_id", userId); // user_id 저장
      console.log("Google Login: access_token saved:", accessToken);
      console.log("Google Login: user_id saved:", userId);
      alert("Google 로그인 성공!");
      navigate("/list"); // 로그인 성공 후 일기 목록 페이지로 이동
    } else {
      console.error("Google Login: 토큰 또는 사용자 ID를 받지 못했습니다. URL:", location.href);
      alert("Google 로그인에 실패했습니다.");
      navigate("/login"); // 실패 시 로그인 페이지로 다시 이동
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Google 로그인 처리 중...</p>
    </div>
  );
};

export default CallbackPage;