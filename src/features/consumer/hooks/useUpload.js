import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { consumerApi } from "../services/consumerApi";
function useUpload({ refresh, resubmit }) {
  const nav = useNavigate(),
    { id } = useParams(),
    [title, setTitle] = useState(""),
    [file, setFile] = useState(null),
    [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (resubmit)
      consumerApi
        .getVideo(id)
        .then((v) => setTitle(v.title || ""))
        .catch((e) => setError(e.message));
  }, [id, resubmit]);
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    let u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const pick = (f) => {
    setError("");
    if (!f) return;
    if (!/\.(mp4|mov)$/i.test(f.name)) {
      setError("Vui lòng chọn video MP4 hoặc MOV.");
      return;
    }
    if (f.size > 300 * 1024 * 1024) {
      setError("Video không được vượt quá 300 MB.");
      return;
    }
    setFile(f);
  };
  return {
    nav,
    id,
    title,
    setTitle,
    file,
    url,
    error,
    setError,
    pick,
    isSubmitting,
    setIsSubmitting,
  };
}
export default useUpload;
