import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import { useAI } from "@/hooks/useAI";
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

const fallbackQuizQuestions = [
  { question: "Fallback question 1?", options: ["A", "B", "C", "D"], correct: 0, explanation: "AI failed to generate." },
  { question: "Fallback question 2?", options: ["A", "B", "C", "D"], correct: 1, explanation: "AI failed to generate." },
];

const Quiz = () => {
  const { callAI, loading } = useAI();
  const [phase, setPhase] = useState("setup"); // setup | quiz | results
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState("5");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (phase === "quiz") {
      const totalSeconds = parseInt(count) * 60; // 1 min per question
      setTimer(totalSeconds);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPhase("results");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase, count]);

  const formatTimer = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const result = await callAI({
      systemPrompt: "You are a quiz generator for CSIT students. Return ONLY a valid JSON array of MCQ objects. Each object must have: question (string), options (array of 4 strings), correct (index 0-3), explanation (string). No markdown, no extra text, just the JSON array.",
      userPrompt: `Generate ${count} ${difficulty} MCQ questions on ${topic} for ${subject}.`,
      parseJSON: true,
    });

    const quizData = Array.isArray(result) ? result : fallbackQuizQuestions;
    setQuestions(quizData);
    setAnswers({});
    setCurrentQ(0);
    setPhase("quiz");
  };

  const selectOption = (idx) => setAnswers({ ...answers, [currentQ]: idx });

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setPhase("results");
  };

  const handleRetake = () => {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setCurrentQ(0);
  };

  // Score calculations
  const correctCount = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;
  const skippedCount = questions.length - answeredCount;
  const scorePercent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const progress = questions.length ? Math.round(((currentQ + 1) / questions.length) * 100) : 0;

  return (
    <DashboardLayout title="Quiz Generator">
      <PageHeader title="Quiz Generator" subtitle="Test your knowledge with AI-generated MCQs on any topic." />

      {/* ── Setup Phase ── */}
      {phase === "setup" && (
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 md:p-8 border border-[#f0ece8]">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Quiz Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. DBMS Normalization" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50">
                <option>Computer Networks</option><option>DBMS</option><option>Operating Systems</option><option>Data Structures</option><option>Software Engineering</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {["Easy", "Medium", "Hard"].map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${difficulty === d ? "bg-[#1a1a1a] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Number of Questions</label>
              <div className="flex gap-2">
                {["5", "10", "15"].map((n) => (
                  <button key={n} onClick={() => setCount(n)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${count === n ? "bg-[#1a1a1a] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{n}</button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={!topic.trim() || loading} className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Quiz...</> : "Generate Quiz"}
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz Phase ── */}
      {phase === "quiz" && questions.length > 0 && (
        <div>
          {/* Progress + Timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#e8612a] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{currentQ + 1}/{questions.length}</span>
            </div>
            <span className="ml-6 text-sm font-mono text-[#e8612a] font-bold bg-[#e8612a]/10 px-3 py-1 rounded-lg">{formatTimer(timer)}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl p-5 md:p-8 border border-[#f0ece8] max-w-2xl mx-auto">
            <p className="text-xs text-[#e8612a] font-medium mb-2">Question {currentQ + 1} of {questions.length}</p>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {questions[currentQ].question}
            </h3>
            <div className="space-y-3">
              {questions[currentQ].options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => selectOption(idx)}
                  className={`border rounded-xl p-4 text-sm cursor-pointer transition-all ${answers[currentQ] === idx ? "border-[#e8612a] bg-[#e8612a]/5 text-[#e8612a] font-medium" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between max-w-2xl mx-auto mt-6">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all">
              <ChevronLeft size={16} /> Previous
            </button>
            {currentQ === questions.length - 1 ? (
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-white rounded-lg text-sm font-semibold hover:bg-[#333] transition-all">Submit Quiz</button>
            ) : (
              <button onClick={() => setCurrentQ(currentQ + 1)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#333] transition-all">Next <ChevronRight size={16} /></button>
            )}
          </div>
        </div>
      )}

      {/* ── Results Phase ── */}
      {phase === "results" && (
        <div>
          <div className="max-w-lg mx-auto text-center bg-white rounded-2xl p-6 md:p-10 border border-[#f0ece8] mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#e8612a] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl md:text-3xl font-bold text-[#e8612a]" style={{ fontFamily: "'DM Serif Display', serif" }}>{scorePercent}%</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Quiz Complete!</h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium">✓ {correctCount} Correct</span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium">✗ {answeredCount - correctCount} Incorrect</span>
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium">○ {skippedCount} Skipped</span>
            </div>
            <button onClick={handleRetake} className="bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg px-6 py-3 text-sm font-semibold transition-all flex items-center gap-2 mx-auto">
              <RotateCcw size={16} /> Retake Quiz
            </button>
          </div>

          {/* Review */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-base font-semibold text-[#1a1a1a]">Review Answers</h3>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              const wasAnswered = answers[i] !== undefined;
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#f0ece8]">
                  <div className="flex items-start gap-2 mb-3">
                    {wasAnswered ? (isCorrect ? <CheckCircle2 size={18} className="text-green-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />) : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 mt-0.5" />}
                    <p className="text-sm font-medium text-[#1a1a1a]">{q.question}</p>
                  </div>
                  {wasAnswered && !isCorrect && (
                    <p className="text-xs text-red-500 ml-[26px] mb-1">Your answer: {q.options[answers[i]]}</p>
                  )}
                  <p className="text-xs text-green-600 ml-[26px] mb-2">Correct: {q.options[q.correct]}</p>
                  <p className="text-xs text-gray-400 ml-[26px]">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Quiz;
