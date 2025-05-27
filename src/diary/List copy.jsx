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
        const token = window.sessionStorage.getItem("access_token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get('http://localhost:8000/diarys/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
            // 날짜 내림차순으로 정렬 (최신 일기가 위에 오도록)
            // `created_at`이 문자열로 올 수 있으므로 `new Date()`로 변환하여 비교
            const sortedDiarys = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDiarys(sortedDiarys);
            setLoading(false);
        })
        .catch((err) => {
            console.error("일기장 데이터를 불러오는 데 실패했습니다:", err.response ? err.response.data : err.message);
            setError('일기장 데이터를 불러오는 데 실패했습니다.');
            setLoading(false);
        });
    }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
        <div className="container"> {/* App.css의 .container 스타일 적용 */}
            <h2 className="page-title">🌱 나의 새싹 일기</h2> {/* App.css의 .page-title 스타일 적용 */}

            {diarys.length === 0 ? (
                <p className="no-diary-message">아직 작성된 일기가 없습니다. 첫 일기를 작성해보세요!</p>
            ) : (
                <ul className="diary-list"> {/* App.css의 .diary-list 스타일 적용 */}
                    {diarys.map((diary) => (
                        <li key={diary.id} className="diary-card"> {/* App.css의 .diary-card 스타일 적용 */}
                            <Link
                                to={`/detail/${diary.id}`}
                                className="diary-link" /* Link 태그 자체에 스타일 적용을 위해 클래스 추가 */
                            >
                                <div className="diary-image-container"> {/* App.css의 .diary-image-container 스타일 적용 */}
                                    {diary.image && imageUrls[diary.id] ? (
                                        <img
                                            src={imageUrls[diary.id]}
                                            alt={diary.title}
                                            className="diary-card-image" /* App.css의 .diary-card-image 스타일 적용 */
                                        />
                                    ) : (
                                        // 이미지가 없거나 로딩 중일 때 플레이스홀더 표시
                                        <div className="diary-card-image-placeholder"></div> /* App.css의 .diary-card-image-placeholder 스타일 적용 */
                                    )}
                                </div>
                                <div className="diary-content"> {/* App.css의 .diary-content 스타일 적용 */}
                                    {/* 작성일자 표시 */}
                                    {diary.created_at && (
                                        <p className="diary-date"> {/* App.css의 .diary-date 스타일 적용 */}
                                            {new Date(diary.created_at).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            }).replace(/\. /g, '/').slice(0, -1)}
                                        </p>
                                    )}

                                    <h3 className="diary-title">{diary.title}</h3> {/* App.css의 .diary-title 스타일 적용 */}

                                    {/* 작성자 정보 표시 */}
                                    {diary.username && (
                                        <p className="diary-author">작성자: {diary.username}</p>
                                    )}

                                    <p className="diary-excerpt"> {/* App.css의 .diary-excerpt 스타일 적용 */}
                                        {diary.content.length > 50
                                            ? diary.content.slice(0, 50) + "..."
                                            : diary.content}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <button className="write-button" onClick={() => navigate("/regist")}> {/* App.css의 .write-button 스타일 적용 */}
                <span className="icon">✏️</span> 글쓰기
            </button>
        </div>
    );
};

export default List;