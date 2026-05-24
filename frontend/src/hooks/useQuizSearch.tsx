import { useState, useEffect, useMemo } from "react";
import { QuizResponse } from "../interfaces/quiz.response.interface";

export function useQuizSearch(data: QuizResponse[]) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // normalização segura
  const normalize = (text?: string) => {
    if (!text) return "";

    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const filteredData = useMemo(() => {
    // 🔥 sempre usa o DATA ORIGINAL
    if (!debouncedSearch.trim()) return data;

    const searchTerm = normalize(debouncedSearch);

    return data.filter((qr) => {
      const title = normalize(qr.quiz?.title);

      return title.includes(searchTerm);
    });
  }, [data, debouncedSearch]);

  return {
    search,
    setSearch,
    filteredData,
    hasResults: filteredData.length > 0,
  };
}