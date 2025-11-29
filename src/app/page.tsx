"use client";

import { useState } from "react";
import './globals.css'; // Import the custom CSS

export default function Home() {
  const [note, setNote] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeNote = async () => {
    setLoadingAnalysis(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleCategorizeNote = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const topCategory = categories.length > 0 ? categories[0] : null;

  return (
    <div className="container">
      <main className="main-content">
        <h1 className="title">Mneme AI Notes</h1>

        <textarea
          className="textarea"
          rows={10}
          placeholder="Enter your note here for AI analysis..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>

        <div className="button-group">
          <button
            onClick={handleAnalyzeNote}
            className="button analyze-button"
            disabled={loadingAnalysis}
          >
            {loadingAnalysis ? "Analyzing..." : "Analyze Note"}
          </button>
          <button
            onClick={handleCategorizeNote}
            className="button categorize-button"
            disabled={loadingCategories}
          >
            {loadingCategories ? "Categorizing..." : "Categorize Note"}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {analysisResult && (
          <section className="section">
            <h2 className="section-title">Note Analysis</h2>
            <p>
              <strong>Sentiment:</strong> {analysisResult.sentiment}
            </p>
            <p>
              <strong>Keywords:</strong> {analysisResult.keywords.join(", ")}
            </p>
          </section>
        )}

        {topCategory && (
          <section className="section">
            <h2 className="section-title">Top Category</h2>
            <p>
              <strong>{topCategory.label}:</strong> {(topCategory.score * 100).toFixed(2)}%
            </p>
          </section>
        )}
      </main>
    </div>
  );
}


