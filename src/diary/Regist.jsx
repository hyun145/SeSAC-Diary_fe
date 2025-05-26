import "../App.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Regist() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    state: "public",
  });
  const [image, setImage] = useState(null);

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
          <select name="state" value={form.state} onChange={handleChange}>
            <option value="public">공개</option>
            <option value="private">비공개</option>
          </select>
        </label>
        <br />
        <button type="submit">등록</button>
      </form>
    </>
  );
}
