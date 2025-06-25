import "../App.css";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);

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
        // ★ JWT 토큰에서 사용자 정보 추출
        const token = window.sessionStorage.getItem("access_token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setCurrentUserId(decodedToken.user_id);
                setCurrentUserRole(decodedToken.role);
            } catch (e) {
                console.error("토큰 디코딩 실패:", e);
                // 유효하지 않은 토큰이면 로그인 상태 초기화
                window.sessionStorage.removeItem("access_token");
                setCurrentUserId(null);
                setCurrentUserRole(null);
            }
        }

        const fetchDiaryDetail = async () => {
            setLoading(true);
            setError(null);

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                const response = await axios.get(`/api/diarys/${diary_id}`, { headers });
                setDiary(response.data);

                if (response.data.image) {
                    const presignedRes = await axios.get(
                        `/api/diarys/download-url?file_key=${encodeURIComponent(response.data.image)}`,
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
    }, [diary_id, navigate]); // 의존성 배열에 diary_id, navigate 추가

    // 이미지 다운로드 메뉴 외부 클릭 감지 (기존 코드와 동일)
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

    // 수정/삭제 메뉴 외부 클릭 감지 (기존 코드와 동일)
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
                await axios.delete(`/api/diarys/${diary_id}`, {
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

    // ★ 수정/삭제 버튼 렌더링 조건
    const isOwner = currentUserId === diary.user_id; // 현재 로그인한 사용자가 일기 작성자인지
    const isAdmin = currentUserRole === "admin";     // 현재 로그인한 사용자가 관리자인지

    // 수정/삭제 버튼을 보여줄지 결정하는 최종 조건
    const showEditDeleteButtons = isOwner || isAdmin;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                position: 'relative',
            }}>
                <h2>{diary.title}</h2>

                {/* ★ 조건부 렌더링: showEditDeleteButtons가 true일 때만 메뉴 버튼 표시 */}
                {showEditDeleteButtons && (
                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button
                            onClick={toggleMenu}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#333',
                                padding: '5px'
                            }}
                        >
                            &#8942; {/* 유니코드 점점점 (vertical ellipsis) */}
                        </button>
                        {isMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '40px',
                                right: '0',
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                minWidth: '100px',
                                zIndex: 1000
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
                                        width: '100%'
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
                                        color: '#dc3545',
                                        width: '100%'
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
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