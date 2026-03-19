import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useAI } from "@/hooks/useAI";
import { Sparkles, Copy, Download, Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NotesGenerator = () => {
  const { callAI, loading } = useAI();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Detailed Explanation");
  const [subject, setSubject] = useState("Computer Networks");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const result = await callAI({
      systemPrompt: "You are an expert academic tutor for CSIT students. Generate well-structured, exam-focused notes. Use clear headings (##), bullet points, bold key terms, and include examples where helpful. Format for easy reading.",
      userPrompt: `Generate ${style} notes on: ${topic} for subject: ${subject}`,
    });
    if (result) setNotes(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.substring(0, 30).replace(/\s/g, "_")}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setTopic("");
    setNotes("");
  };

  // Simple markdown-to-HTML renderer
  const renderMarkdown = (text) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mt-4 mb-2 text-[#1a1a1a]">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-5 mb-2 text-[#1a1a1a]">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-6 mb-3 text-[#1a1a1a]">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1a1a1a]">$1</strong>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc text-gray-700 text-sm leading-relaxed">$1</li>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc text-gray-700 text-sm leading-relaxed">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <DashboardLayout title="Notes Generator">
      <PageHeader title="Notes Generator" subtitle="Generate structured, exam-ready notes on any topic using AI." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-[#f0ece8] h-fit">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Topic or Question</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Explain the OSI model in Computer Networks'"
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
              >
                <option>Detailed Explanation</option>
                <option>Bullet Points</option>
                <option>Short Summary</option>
                <option>Exam Focused</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
              >
                <option>Computer Networks</option>
                <option>DBMS</option>
                <option>Operating Systems</option>
                <option>Data Structures</option>
                <option>Software Engineering</option>
                <option>Other</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading}
              className="w-full bg-[#e8612a] hover:bg-[#d4541f] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate Notes</>
              )}
            </button>

            {(notes || topic) && (
              <button onClick={handleClear} className="w-full border border-gray-200 text-gray-500 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl p-5 md:p-6 border border-[#f0ece8] min-h-[400px] md:min-h-[500px] flex flex-col">
          {loading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-1/2 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-5 w-2/3 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : notes ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#1a1a1a] truncate max-w-[60%]">{topic}</h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
              <div
                className="prose text-sm leading-relaxed text-gray-700 flex-1 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
              />
            </>
          ) : (
            <EmptyState icon={Sparkles} title="Your notes will appear here" subtitle="Enter a topic and click Generate to start." />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesGenerator;
