import { useEffect, useState } from "react";
import { getNews } from "../api/news.js";

const arrowStyles = "absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 px-3 py-1 text-2xl text-white hover:bg-black/60";

export default function News() {
    const [articles, setArticles] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        // News is optional: if it fails, the section just doesn't render.
        getNews(controller.signal).then(setArticles).catch(() => {});
        return () => controller.abort();
    }, []);

    if (articles.length === 0) return null;

    const article = articles[index];
    const go = (step) => setIndex((index + step + articles.length) % articles.length);

    return (
        <section className="w-full max-w-4xl">
            <h2 className="text-center">Latest news</h2>
            <div className="relative h-[300px] overflow-hidden rounded-lg bg-gray-800 md:h-[450px]">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.image?.startsWith("https") && (
                        <img src={article.image} alt="" className="size-full object-cover" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-12 text-left text-white">
                        <h3 className="text-lg md:text-xl">{article.title}</h3>
                        <p className="hidden text-sm md:block">{article.description}</p>
                    </div>
                </a>
                <button className={`${arrowStyles} left-3`} onClick={() => go(-1)} aria-label="Previous article">‹</button>
                <button className={`${arrowStyles} right-3`} onClick={() => go(1)} aria-label="Next article">›</button>
            </div>
            <div className="mt-3 flex justify-center gap-2">
                {articles.map((a, i) => (
                    <button
                        key={a.url}
                        className={`size-2.5 cursor-pointer rounded-full ${i === index ? "bg-brand" : "bg-gray-300"}`}
                        onClick={() => setIndex(i)}
                        aria-label={`Show article ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
