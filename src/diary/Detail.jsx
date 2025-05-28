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
    const containerRef = useRef(null); // 이미지 다운로드 메뉴용 ref
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림/닫힘 상태
    const menuRef = useRef(null); // 수정/삭제 메뉴용 ref

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

    useEffect(() => {
        const fetchDiaryDetail = async () => {
            setLoading(true);
            setError(null);
            const token = window.sessionStorage.getItem("access_token");

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                const response = await axios.get(`http://localhost:8000/diarys/${diary_id}`, { headers });
                setDiary(response.data);

                if (response.data.image) {
                    const presignedRes = await axios.get(
                        `http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(response.data.image)}`,
                        { headers: { Authorization: `Bearer ${token}` } }
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
                        errorMessage = '비공개 일기이거나, 이 일기에 접근할 권한이 없습니다.';
                    } else if (err.response.data && err.response.data.detail) {
                        errorMessage = err.response.data.detail;
                    }
                }
                
                alert(errorMessage);
                navigate("/list");
            } finally {
                setLoading(false);
            }
        };

        fetchDiaryDetail();
    }, [diary_id, navigate]);

    // 이미지 다운로드 메뉴 외부 클릭 감지
    useEffect(() => {
        const handleClickOutsideImageMenu = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDownload(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideImageMenu);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideImageMenu);
        };
    }, []);

    // 수정/삭제 메뉴 외부 클릭 감지
    useEffect(() => {
        const handleClickOutsideActionMenu = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutsideActionMenu);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideActionMenu);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideActionMenu);
        };
    }, [isMenuOpen]);

    const handleDelete = async () => {
        setIsMenuOpen(false); // 삭제 버튼 클릭 시 메뉴 닫기
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            const token = window.sessionStorage.getItem("access_token");
            if (!token) {
                alert("로그인 후 삭제할 수 있습니다.");
                navigate("/login");
                return;
            }

            try {
                await axios.delete(`http://localhost:8000/diarys/${diary_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("일기가 성공적으로 삭제되었습니다.");
                navigate("/list");
            } catch (err) {
                console.error("일기 삭제 실패:", err.response ? err.response.data : err.message);
                let errorMessage = "일기 삭제에 실패했습니다.";
                if (err.response && err.response.data && err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response && err.response.status === 403) {
                    errorMessage = "이 일기를 삭제할 권한이 없습니다.";
                }
                alert(errorMessage);
            }
        }
    };


    const handleModify = () => {
        setIsMenuOpen(false); // 수정 버튼 클릭 시 메뉴 닫기
        navigate(`/modifydetail/${diary_id}`);

    };

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;
    if (!diary) return <p>일기 정보가 없습니다.</p>;

    return (
        <div style={{ padding: '20px' }}> {/* 이 div에는 relative를 제거하고, 헤더 div에 relative를 줍니다. */}
            {/* 제목과 메뉴 버튼을 감싸는 컨테이너 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between', // 제목과 메뉴를 양 끝으로 정렬
                alignItems: 'center',           // 수직 중앙 정렬
                marginBottom: '20px',           // 아래 여백
                position: 'relative',           // 메뉴 드롭다운의 기준점
            }}>
                <h2>{diary.title}</h2>
                
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
                            padding: '5px' // 클릭 영역 확보
                        }}
                    >
                        &#8942; {/* 유니코드 점점점 (vertical ellipsis) */}
                    </button>
                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '40px', // 버튼 아래로
                            right: '0',  // 버튼 오른쪽 끝에 맞춤
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            minWidth: '100px',
                            zIndex: 1000 // 다른 요소 위에 표시
                        }}>
                            <button
                                onClick={handleModify}
                                style={{
                                    padding: '8px 10px',
                                    border: 'none',
                                    background: 'none',
                                    color: '#000000',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    width: '100%' // 버튼 너비 100%로 설정
                                }}
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '8px 10px',
                                    border: 'none',
                                    background: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    color: '#dc3545', // 삭제 버튼은 빨간색
                                    width: '100%' // 버튼 너비 100%로 설정
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* 이미지 및 기타 일기 내용 */}
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
            <p><strong></strong> {diary.content}</p>
            <p><strong>공개여부:</strong> {diary.state ? "공개" : "비공개"}</p>
            <p><strong>감정:</strong> {emotionToEmoji(diary.emotion)}</p>

            <button onClick={() => navigate('/list')} style={{ marginTop: '20px' }}>
                목록으로
            </button>
        </div>
    );
};

export default Detail;