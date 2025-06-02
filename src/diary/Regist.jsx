import "../App.css";
import axios from "axios";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

export default function Regist() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    state: true,

  });
  const [image, setImage] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const passedDate = location.state?.diary_date || getLocalDateString();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleChangeFile = (e) => {
    setImage(e.target.files[0]);
  };

  const handleStateChange = (e) => {
    // select 박스의 value는 항상 문자열이므로, 불리언으로 변환해야 합니다.
    setForm({
      ...form,
      state: e.target.value === "public" ? true : false,
    });
  };

  const checkDuplicateDiary = async () => {
    const token = window.sessionStorage.getItem("access_token");
    try {
      const res = await axios.get(`http://localhost:8000/diarys/check-duplicate`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { diary_date: passedDate }
      });
      setIsDuplicate(res.data.exists);  // true or false
    } catch (err) {
      console.error("중복 검사 실패:", err);
      // 실패해도 그냥 false로 둬서 글쓰기는 진행 가능하게 둠
      setIsDuplicate(false);
    }
  };

  // 컴포넌트가 처음 마운트 될 때 중복 검사 실행
  useEffect(() => {
    checkDuplicateDiary();
  }, [passedDate]);





  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = window.sessionStorage.getItem("access_token");

    try {
      let image_url = "";

      if (image) {
        const ext = image.name.split('.').pop().toLowerCase();
        const presignedRes = await axios.get(`http://localhost:8000/diarys/presigned-url?file_type=${ext}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { url, key } = presignedRes.data;

        await axios.put(url, image); // S3로 업로드
        image_url = key;
      }

      const res = await axios.post("http://localhost:8000/diarys/", {
        title: form.title,
        content: form.content,
        state: form.state,
        image: image_url,
        diary_date: passedDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 201) {
        alert("일기 등록 완료!");
        navigate("/list");
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  return (
    <>
      <h2>일기 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="제목을 입력하세요."
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="내용을 입력하세요."
          rows="5"
          cols="40"
        />
        <input type="file" onChange={handleChangeFile} />
        <label>
          공개여부:
          <select name="state" value={form.state ? "public" : "private"} onChange={handleStateChange}>
            <option value="public">공개</option>
            <option value="private">비공개</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={isDuplicate}>
          {isDuplicate ? "이미 작성된 날짜입니다" : "등록"}
        </button>
      </form>
      <button onClick={() => navigate('/list')} style={{ marginTop: '20px' }}>
        목록으로
      </button>
    </>
  );
}
