// src/diary/DiaryUpload.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const bucketName = import.meta.env.VITE_S3_BUCKET;
const region = import.meta.env.VITE_S3_REGION;


export default function DiaryUpload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("이미지를 선택해주세요.");

    const token = window.sessionStorage.getItem("access_token");

    try {
      const presignedRes = await axios.get("/api/s3/presigned-url");
      const { url, key } = presignedRes.data;

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

      await axios.post(
        "/api/diaries/",
        { title, content, image_url: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("일기 등록 완료!");
      navigate("/list");
    } catch (err) {
      console.error(err);
      alert("일기 업로드 실패");
    }
  };

  return (
    <div>
      <h2>일기 등록</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} /><br />
        <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} rows="8" cols="40" /><br />
        <input type="file" onChange={handleFileChange} /><br />
        <button type="submit">업로드</button>
      </form>
    </div>
  );
}
