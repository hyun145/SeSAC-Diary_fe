import "../App.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const List = () => {
  const [diarys, setDiarys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const navigate = useNavigate();

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
    if (!token) {
      alert("로그인 후 사용하세요.");
      navigate("/login");
    }
  }, []);

  // 일기 목록 가져오기
  useEffect(() => {
    axios.get('http://localhost:8000/diarys/')
      .then((response) => {
        setDiarys(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('일기장 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>일기 목록</h2>
      {diarys.length === 0 ? (
        <p>일기가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {diarys.map((diary) => (
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
      <button onClick={() => navigate("/regist")}>일기 등록</button>
    </div>
  );
};

export default List;
