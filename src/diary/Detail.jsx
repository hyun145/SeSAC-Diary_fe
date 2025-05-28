import "../App.css";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Detail = () => {
  const { diary_id } = useParams();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const emotionToEmoji = (emotion) => {
    switch (emotion) {
      case '긍정':
        return '😄';
      case '중립':
        return '😐';
      case '부정':
        return '😠';
      case '슬픔':
        return '😢';
      case '놀람':
        return '😲';
      default:
        return '❓';
    }
  };

  // useEffect(() => {
  //   axios.get(`http://localhost:8000/diarys/${diary_id}`)
  //     .then(async (response) => {
  //       setDiary(response.data);
  //       setLoading(false);

  //       // 이미지가 있을 경우 presigned URL 요청
  //       if (response.data.image) {
  //         const token = window.sessionStorage.getItem("access_token");
  //         const presignedRes = await axios.get(
  //           `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(response.data.image)}`,
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         setImageUrl(presignedRes.data.download_url);
  //       }
  //     })
  //     .catch(() => {
  //       setError('일기 정보를 불러오는 데 실패했습니다.');
  //       setLoading(false);
  //     });
  // }, [diary_id]);

  useEffect(() => {
    const fetchDiaryDetail = async () => {
      setLoading(true);
      setError(null);
      const token = window.sessionStorage.getItem("access_token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // 첫 번째 axios.get 호출에 토큰 포함
        const response = await axios.get(`http://localhost:8000/diarys/${diary_id}`, { headers });
        setDiary(response.data);

        // 이미지가 있을 경우 presigned URL 요청 (이 부분은 이미 토큰을 사용하고 있었음)
        if (response.data.image) {
          const presignedRes = await axios.get(
            `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(response.data.image)}`,
            { headers: { Authorization: `Bearer ${token}` } } // 여기는 이미 토큰이 있었음
          );
          setImageUrl(presignedRes.data.download_url);
        }
      } catch (err) {
        console.error("일기 정보 불러오기 실패:", err.response ? err.response.data : err.message);

        let errorMessage = "일기 정보를 불러오는 데 실패했습니다.";
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = '로그인이 필요합니다. 일기 조회 권한이 없습니다.';
          } else if (err.response.status === 403) {
            errorMessage = '비공개 일기입니다. 이 일기에 접근할 권한이 없습니다.';
          } else if (err.response.data && err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }

        // alert 띄우고 확인 누르면 목록으로 이동
        alert(errorMessage);
        navigate("/list"); // 항상 목록으로 이동
        // ------------------------------------

      } finally {
        setLoading(false);
      }
    };

    fetchDiaryDetail();
  }, [diary_id, navigate]);

  // --- 삭제 버튼 핸들러 함수 추가 ---
  const handleDelete = async () => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      const token = window.sessionStorage.getItem("access_token");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        await axios.delete(`http://localhost:8000/diarys/${diary_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert("일기가 성공적으로 삭제되었습니다.");
        navigate("/list"); // 삭제 후 목록 페이지로 이동
      } catch (err) {
        console.error("일기 삭제 실패:", err.response ? err.response.data : err.message);
        let errorMessage = "일기 삭제에 실패했습니다.";
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "인증되지 않은 사용자입니다. 다시 로그인 해주세요.";
          } else if (err.response.status === 403) {
            errorMessage = "삭제 권한이 없습니다. 일기 작성자만 삭제할 수 있습니다.";
          } else if (err.response.data && err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }
        alert(errorMessage);
      }
    }
  };
  // ----------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDownload(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;
  if (!diary) return <p>일기 정보가 없습니다.</p>;

  const storedUserId = window.sessionStorage.getItem("user_id");
  const loggedInUserId = storedUserId ? parseInt(storedUserId) : null;
  const isCurrentUserOwner = (loggedInUserId !== null && !isNaN(loggedInUserId) && loggedInUserId === diary.user_id);

  return (
    <div ref={containerRef}>
      <h2>{diary.title}</h2>

      {imageUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={imageUrl}
            alt={diary.title}
            style={{ width: '300px', cursor: 'pointer', display: 'block' }}
            onClick={() => setShowDownload(!showDownload)}
          />
          {showDownload && (
            <a
              href={imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#e0e0e0',
                color: '#555555',
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                textDecoration: 'none',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              이미지 다운로드
            </a>
          )}
        </div>
      )}
      {diary.username && (
        <p className="detail-author"><strong>작성자:</strong> {diary.username}</p>
      )}
      <p><strong>내용:</strong> {diary.content}</p>
      <p><strong>공개여부:</strong> {diary.state ? "공개" : "비공개"}</p>
      <p><strong>감정:</strong> {emotionToEmoji(diary.emotion)}</p>

      <button onClick={() => navigate('/list')} style={{ marginTop: '20px' }}>
        목록으로
      </button>

      
      {/* --- isCurrentUserOwner가 true일 때만 수정 버튼과 삭제 버튼을 렌더링 --- */}
      {isCurrentUserOwner && (
        <> {/* 수정 및 삭제 버튼을 함께 렌더링하기 위해 Fragment 사용 */}
          <button
            onClick={() => navigate(`/modifydetail/${diary_id}`)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1em',
              marginLeft: '10px' // 목록 버튼과의 간격 조절
            }}
          >
            수정
          </button>
          
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1em',
              marginLeft: '10px' // 수정 버튼과의 간격 조절
            }}
          >
            삭제
          </button>
        </>
      )}
    </div>
  );
};

export default Detail;