import { useEffect, useState } from "react";
import '../CSS/News.css';

export default function News() {
  const [articles, setArticles] = useState([]);
  const API_KEY = "ce813b171f3080bf80b1c72e226f8cf2";

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(
          `https://gnews.io/api/v4/search?q=Ukraine&lang=en&country=us&max=5&apikey=${API_KEY}`
        );
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchNews();
  }, []);

  if (articles.length === 0) return <p>Loading...</p>;

  return (
    <div id="newsCarousel" className="carousel slide">
      <div className="carousel-indicators">
        {articles.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#newsCarousel"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {articles.map((article, i) => (
          <div
            key={i}
            className={`carousel-item ${i === 0 ? "active" : ""}`}
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={article.image || `${import.meta.env.BASE_URL}images/fallback.jpg`}
                className="d-block w-100"
                alt="News visual"
              />
            </a>

            <div className="carousel-caption d-md-block">
              <h5>{article.title}</h5>
              <p>{article.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#newsCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon"></span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#newsCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}
