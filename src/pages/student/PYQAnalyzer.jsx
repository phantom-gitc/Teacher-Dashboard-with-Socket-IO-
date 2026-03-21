import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useAI } from "@/hooks/useAI";
import { fallbackPYQAnalysis } from "@/lib/mockData";
import { UploadCloud, Loader2, RefreshCw, Star, Lightbulb, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PYQAnalyzer = () => {
  const { callAI, loading } = useAI();
  const [textInput, setTextInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setTextInput(ev.target.result);
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!textInput.trim()) return;
    setShowResults(true);

    const result = await callAI({
      systemPrompt: "You are an expert exam analyzer for CSIT students. Analyze the given question paper text and return ONLY a JSON object with keys: repeated_topics (array of strings with frequency), important_topics (array of strings), predicted_questions (array of question strings). No markdown, no explanation, just valid JSON.",
      userPrompt: `Analyze this question paper and identify patterns:\n\n${textInput}`,
      parseJSON: true,
    });

    setResults(result || fallbackPYQAnalysis);
  };

  const handleReset = () => {
    setShowResults(false);
    setResults(null);
    setTextInput("");
    setFileName("");
  };

  const panels = results ? [
    { title: "🔁 Repeated Topics", icon: RefreshCw, color: "border-orange-200 bg-orange-50", items: results.repeated_topics },
    { title: "⭐ Important Topics", icon: Star, color: "border-yellow-200 bg-yellow-50", items: results.important_topics },
    { title: "🔮 Predicted Questions", icon: Lightbulb, color: "border-blue-200 bg-blue-50", items: results.predicted_questions },
  ] : [];

  return (
    <DashboardLayout title="PYQ Analyzer">
      <PageHeader title="PYQ Analyzer" subtitle="Upload previous year question papers and get AI-powered insights." />

      {!showResults ? (
        <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-dashed border-[#e8612a]/30 text-center w-full">
          <UploadCloud size={56} className="text-[#e8612a] mx-auto mb-4 md:w-16 md:h-16" />
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Upload Question Paper</h3>
          <p className="text-sm text-gray-400 mb-6">Supports .txt files or paste text directly below</p>

          <label className="inline-block px-6 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-all mb-1">
            Choose File
            <input type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
          </label>
          {fileName && <p className="text-xs text-[#e8612a] mt-1">{fileName}</p>}

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">or paste text</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or paste your question paper text here..."
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 resize-none mb-4"
          />

          <button
            onClick={handleAnalyze}
            disabled={!textInput.trim() || loading}
            className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : "Analyze Question Paper"}
          </button>
        </div>
      ) : (
        <div>
          <button onClick={handleReset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#e8612a] transition-colors mb-6">
            <ArrowLeft size={16} /> Back to upload
          </button>

          {loading || !results ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-[#f0ece8]">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((j) => <Skeleton key={j} className="h-4 w-full" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {panels.map((panel) => (
                <div key={panel.title} className={`rounded-2xl p-5 md:p-6 border ${panel.color}`}>
                  <h3 className="text-base font-semibold text-[#1a1a1a] mb-4">{panel.title}</h3>
                  <ul className="space-y-2.5">
                    {panel.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e8612a] mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PYQAnalyzer;
