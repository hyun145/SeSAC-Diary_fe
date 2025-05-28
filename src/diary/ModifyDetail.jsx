import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/modify.css";

const ModifyDetail = () => {
    const { diary_id } = useParams();
    const [diary, setDiary] = useState({ title: "", content: "", image: "", state: true }); // state 필드 추가 및 기본값 true
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const token = window.sessionStorage.getItem("access_token");

    useEffect(() => {
        const fetchDiaryData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/diarys/${diary_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setDiary({
                    title: response.data?.title || "",
                    content: response.data?.content || "",
                    image: response.data?.image || "",
                    state: response.data?.state ?? true, // state 값 불러오기, undefined일 경우 기본값 true
                });
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('해당 일기를 찾을 수 없습니다.');
                    setTimeout(() => navigate('/list'), 3000);
                } else {
                    console.error("일기 데이터 불러오기 실패", error);
                    setError("일기 데이터를 불러오는 데 실패했습니다.");
                }
            }
        };

        if (token) {
            fetchDiaryData();
        } else {
            alert("토큰값이 없습니다. 로그인 해주세요.");
            navigate('/login'); // 로그인 페이지로 이동하도록 수정
        }
    }, [diary_id, token, navigate]); // navigate를 의존성 배열에 추가

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDiary({ ...diary, [name]: value });
    };

    const handleChangeFile = (e) => {
        setImage(e.target.files[0]);
    };

    // 공개/비공개 드롭다운 변경 핸들러
    const handleStateChange = (e) => {
        setDiary({
            ...diary,
            state: e.target.value === "public" ? true : false,
        });
    };

    const handleSave = async () => {
        if (!token) {
            alert("유효하지 않은 토큰입니다. 다시 로그인 해주세요.");
            navigate('/login'); // 로그인 페이지로 이동하도록 수정
            return;
        }

        setLoading(true);
        try {
            let image_url = diary.image; // 기존 이미지 URL을 사용

            if (image) { // 새 이미지가 선택된 경우에만 S3 업로드 진행
                const ext = image.name.split('.').pop().toLowerCase();
                const presignedRes = await axios.get(`http://localhost:8000/diarys/presigned-url?file_type=${ext}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { url, key } = presignedRes.data;

                await axios.put(url, image); // S3로 업로드
                image_url = key; // 업로드 후 이미지 URL로 업데이트
            }

            const updatedDiary = {
                title: diary.title,
                content: diary.content,
                state: diary.state, // state 필드 포함
                image: image_url, // 이미지 URL 업데이트
            };

            // 일기 데이터를 PUT 요청으로 서버에 저장 (전체 업데이트)
            await axios.put(`http://localhost:8000/diarys/${diary_id}`, updatedDiary, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("일기가 성공적으로 수정되었습니다.");
            navigate(`/detail/${diary_id}`); // 수정 완료 후 상세 페이지로 이동
        } catch (error) {
            console.error("일기 수정 실패", error);
            // 에러 응답이 있다면 구체적인 메시지 출력
            alert("일기 수정에 실패했습니다: " + (error.response?.data?.detail || "알 수 없는 오류"));
        } finally {
            setLoading(false);
        }
    };

    if (error) return <p>{error}</p>;
    if (loading) return <p>수정 중...</p>;

    return (
        <div className="modify-page">
            <h1>일기 수정</h1>
            <div className="modify-form">
                <input
                    type="text"
                    name="title"
                    value={diary.title}
                    placeholder="수정할 제목을 입력하세요."
                    onChange={handleChange}
                />
                <textarea
                    name="content"
                    value={diary.content}
                    placeholder="수정할 내용을 입력하세요."
                    onChange={handleChange}
                    rows="10" // textarea 높이 조정
                    cols="50" // textarea 너비 조정
                />
                {diary.image && ( // 기존 이미지가 있으면 표시
                    <div style={{ marginBottom: '10px' }}>
                        <p>현재 이미지:</p>
                        <img src={`http://localhost:8000/diarys/download-url?file_key=${encodeURIComponent(diary.image)}`} 
                             alt="현재 일기 이미지"
                             style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                        />
                    </div>
                )}
                <input type="file" onChange={handleChangeFile} />
                <label>
                    공개여부:
                    <select name="state" value={diary.state ? "public" : "private"} onChange={handleStateChange}>
                        <option value="public">공개</option>
                        <option value="private">비공개</option>
                    </select>
                </label>
            </div>
            <div className="button-group">
                <button onClick={handleSave} disabled={loading}>
                    {loading ? '수정 중...' : '수정 완료'}
                </button>
                <button
                onClick={() => navigate(`/detail/${diary_id}`)}
                className="cancel-button"
                style={{ backgroundColor: '#f44336', color: 'white' }} // 배경색과 글자색 지정
                >
                취소
                </button>
            </div>
        </div>
    );
};

export default ModifyDetail;