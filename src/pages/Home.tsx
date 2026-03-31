import { useEffect, useState } from "react";
import { api } from "../api/client";

type MessageResponse = {
  message: string;
};

export default function Home() {
  const [message, setMessage] = useState("Carregando...");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<MessageResponse>("/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((err) => {
        console.error(err);
        setError("Erro ao conectar com o back-end");
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Frontend Vite + FastAPI</h1>
      {error ? <p>{error}</p> : <p>{message}</p>}
    </div>
  );
}