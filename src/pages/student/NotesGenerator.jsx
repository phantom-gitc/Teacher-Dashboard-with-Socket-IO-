import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { Sparkles, Copy, Download, Loader2, X, Check, Maximize2, Minimize2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import html2pdf from "html2pdf.js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-gray-800 bg-[#1e1e1e] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-2 text-xs text-gray-400 font-mono lowercase">{match[1]}</span>
        </div>
        <button 
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-600 cursor-pointer"
        >
          {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="text-[13px] sm:text-sm overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  ) : (
    <code className="bg-orange-50 text-[#e8612a] px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>
      {children}
    </code>
  );
};

const NotesGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Initialize state from localStorage to persist across refreshes
  const [topic, setTopic] = useState(() => localStorage.getItem("csit_notes_topic") || "");
  const [style, setStyle] = useState(() => localStorage.getItem("csit_notes_style") || "Detailed Explanation");
  const [subject, setSubject] = useState(() => localStorage.getItem("csit_notes_subject") || "Computer Networks");
  const [notes, setNotes] = useState(() => localStorage.getItem("csit_notes_content") || "");
  const [generatedTopic, setGeneratedTopic] = useState(() => localStorage.getItem("csit_notes_generated_topic") || "");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save to localStorage whenever user inputs or notes change
  useEffect(() => {
    localStorage.setItem("csit_notes_topic", topic);
    localStorage.setItem("csit_notes_style", style);
    localStorage.setItem("csit_notes_subject", subject);
    localStorage.setItem("csit_notes_content", notes);
    localStorage.setItem("csit_notes_generated_topic", generatedTopic);
  }, [topic, style, subject, notes, generatedTopic]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Use the dedicated notes endpoint (has caching + correct prompt)
      const res = await api.post("/ai/notes/generate", { topic, subject, style });
      const content = res.data?.content || "";
      if (content) {
        setNotes(content);
        setGeneratedTopic(topic);
      }
      else setError("No content was generated. Please try again.");
    } catch (err) {
      console.error("Notes generation error:", err);
      setError(err.message || "Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const element = document.getElementById("rendered-notes-content");
    if (element) {
      navigator.clipboard.writeText(element.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = document.getElementById("rendered-notes-content")?.innerHTML;
    if (!content) return;
    
    // Grab current page styles so syntax highlighting remains in the PDF
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('');
      
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Notes - ${generatedTopic}</title>
          ${styles}
          <style>
            body { padding: 40px; margin: 0; background: white; color: black; font-family: system-ui, sans-serif; }
            /* Force exact colors for syntax highlighting in print */
            pre, code, .bg-\\[\\#1e1e1e\\], div { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            @page {
              size: A4 portrait;
              margin: 15mm;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #888;
                font-family: system-ui, sans-serif;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait slightly for styles to apply before invoking print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleClear = () => {
    setTopic("");
    setNotes("");
    setGeneratedTopic("");
  };

  // We now use ReactMarkdown instead of the custom regex parser.

  return (
    <DashboardLayout title="Notes Generator">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
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
        <div className={isFullscreen 
          ? "fixed inset-4 md:inset-8 z-[100] bg-white shadow-2xl rounded-2xl p-6 md:p-10 flex flex-col border border-gray-200 overflow-hidden" 
          : "col-span-1 lg:col-span-3 bg-white rounded-2xl p-5 md:p-6 border border-[#f0ece8] min-h-[400px] max-h-[700px] flex flex-col"
        }>
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center flex-1 py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center max-w-sm">
                <p className="text-sm font-medium text-red-700 mb-1">Generation Failed</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            </div>
          ) : notes ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#1a1a1a] truncate max-w-[60%]">{topic}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    {isFullscreen ? <><Minimize2 size={12} /> Minimize</> : <><Maximize2 size={12} /> Maximize</>}
                  </button>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
              <div id="rendered-notes-content" className="flex-1 overflow-y-auto pr-2 pb-8 scrollbar-hide">
                {generatedTopic && (
                  <div className="mb-6 pb-4 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">{generatedTopic}</h1>
                  </div>
                )}
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-3 text-[#1a1a1a]" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-2 text-[#1a1a1a]" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2 text-[#1a1a1a]" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-[#1a1a1a]" {...props} />,
                    }}
                  >
                    {notes}
                  </ReactMarkdown>
                </div>
              </div>
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
