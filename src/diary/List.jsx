import "../App.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CalendarComponent from '../calendar';

const List = () => {
    const [diarys, setDiarys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageUrls, setImageUrls] = useState({});
    const [filteredDiarys, setFilteredDiarys] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        // 로컬 시간 기준으로 초기 날짜 설정
        (() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        })()
    );
    const navigate = useNavigate();

    const [isDuplicate, setIsDuplicate] = useState(false); 

    // Presigned URL 받아오기
    const getPresignedUrl = async (key) => {
        const token = window.sessionStorage.getItem("access_token");
        const res = await axios.get(
            `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(key)}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data.download_url;
    };

    // 이미지 URL 가져오기
    useEffect(() => {
        const fetchPresignedUrls = async () => {
            const urls = {};
            for (const diary of diarys) {
                if (diary.image) {
                    urls[diary.id] = await getPresignedUrl(diary.image);
                }
            }
            setImageUrls(urls);
        };
        if (diarys.length > 0) fetchPresignedUrls();
    }, [diarys]);

    // 로그인 체크
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        const userIdFromSession = window.sessionStorage.getItem("user_id"); 
        
        // 디버깅 로그
        console.log("--- List.js: useEffect [로그인/사용자 ID 로드] ---");
        console.log("SessionStorage Token:", token ? "존재함" : "없음");
        console.log("SessionStorage User ID (원본):", userIdFromSession);
        if (!token) {
            alert("로그인 후 사용하세요.");
            navigate("/login");
        }
    }, []);
    
    // 일기 목록 가져오기
    useEffect(() => {
        const token = window.sessionStorage.getItem("access_token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get('http://localhost:8000/diarys/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
            // 백엔드에서 이미 정렬되어 오므로, 클라이언트 측 정렬은 제거
            setDiarys(response.data); 
            setLoading(false);
        })
        .catch((err) => {
            console.error("일기장 데이터를 불러오는 데 실패했습니다:", err.response ? err.response.data : err.message);
            setError('일기장 데이터를 불러오는 데 실패했습니다.');
            setLoading(false);
        });
    }, []);

    const checkDuplicateDiary = async (date) => {
        const token = window.sessionStorage.getItem("access_token");
        if (!token) return; // 토큰이 없으면 검사하지 않음

        try {
            const res = await axios.get(`http://localhost:8000/diarys/check-duplicate`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { diary_date: date }
            });
            setIsDuplicate(res.data.exists); // true or false
        } catch (err) {
            console.error("중복 검사 실패:", err);
            setIsDuplicate(false); // 오류 발생 시 안전하게 false로 설정
        }
    };

    // useEffect 내부 (선택된 날짜와 일기 작성일이 같으면 필터링)
    useEffect(() => {
        if (selectedDate) {
            // 기존 필터링 로직 (UI 표시용)
            const filtered = diarys.filter(
                (diary) => diary.diary_date === selectedDate 
            );
            setFilteredDiarys(filtered);
            
            checkDuplicateDiary(selectedDate);

        } else {
            setFilteredDiarys(diarys);
            setIsDuplicate(false); // 날짜가 선택되지 않으면 중복 아님으로 설정
        }
    }, [selectedDate, diarys]); // diarys가 변경될 때도 filteredDiarys가 업데이트되므로 의존성 배열에 추가

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    // const hasDiaryForSelectedDate = filteredDiarys.length > 0; // 이 변수는 이제 사용하지 않아도 됩니다.

    return (
        <div style={{ padding: '20px' }}>

            <CalendarComponent
              onDateSelect={setSelectedDate}
              attendDates={Array.from(
                new Set(diarys.map(d => d.diary_date))
              )}
            />

   <h3>
        {new Date(selectedDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit', // 월을 두 자리 숫자로
            day: '2-digit',   // 일을 두 자리 숫자로
            weekday: 'short'  // 요일 (예: 수, 목)
        })}
    </h3>

            {filteredDiarys.length === 0 ? (
            <p>오늘은 일기가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {filteredDiarys.map((diary) => (
                        <li
                            key={diary.id}
                            style={{
                                marginBottom: '20px',
                                borderBottom: '1px solid #ccc',
                                paddingBottom: '20px',
                            }}
                        >
                            <Link
                                to={`/detail/${diary.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    {diary.image && imageUrls[diary.id] && (
                                        <img
                                            src={imageUrls[diary.id]}
                                            alt={diary.title}
                                            style={{
                                                width: '200px',
                                                height: 'auto',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )}
                                    <div>
                                        <h3>{diary.title}</h3>
                                        {/* --- 추가: 작성자 정보 표시 --- */}
                                        {diary.username && (
                                            <p className="diary-author" style={{ fontSize: '0.9em', color: '#888', marginTop: '5px' }}>
                                                <strong>작성자:</strong> {diary.username}
                                            </p>
                                        )}
                                        {/* --- 추가 끝 --- */}
                                        <p style={{ maxWidth: "500px", color: "#555" }}>
                                            {diary.content.length > 100
                                                ? diary.content.slice(0, 100) + "..."
                                                : diary.content}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <button
                className="write-button"
                onClick={() => navigate("/regist", { state: { diary_date: selectedDate } })}
                disabled={isDuplicate} 
                style={{
                    backgroundColor: isDuplicate ? '#cccccc' : '', // 중복이면 회색, 아니면 기본 색상
                    cursor: isDuplicate ? 'not-allowed' : 'pointer', // 마우스 오버 시 커서 모양 변경
                }}
            >
                <span className="icon">✏️</span> {isDuplicate ? "오늘 일기 작성 완료" : "글쓰기"}
            </button>
        </div>
    );
};

export default List;