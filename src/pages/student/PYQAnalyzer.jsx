import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import api from "@/lib/api";
import { UploadCloud, Loader2, RefreshCw, Star, Lightbulb, ArrowLeft, Copy, Download, Maximize2, Minimize2, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const PYQAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [fileMimeType, setFileMimeType] = useState("");
  const [showResults, setShowResults] = useState(() => localStorage.getItem("csit_pyq_show_results") === "true");
  const [results, setResults] = useState(() => localStorage.getItem("csit_pyq_results") || null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("csit_pyq_show_results", showResults);
    if (results) {
      localStorage.setItem("csit_pyq_results", results);
    } else {
      localStorage.removeItem("csit_pyq_results");
    }
  }, [showResults, results]);

  const handleCopy = () => {
    const el = document.getElementById('rendered-pyq-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('rendered-pyq-content');
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    const content = element.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>PYQ Analysis - CSIT Hub</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            h1 { color: #e8612a; border-bottom: 2px solid #f0ece8; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
            h2 { color: #1a1a1a; margin-top: 30px; margin-bottom: 15px; font-size: 20px; }
            h3 { color: #333; margin-top: 25px; margin-bottom: 12px; font-size: 18px; }
            p { margin-bottom: 16px; }
            ul, ol { margin-bottom: 20px; padding-left: 24px; }
            li { margin-bottom: 8px; }
            code { background-color: #f9f9f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #e8612a; font-size: 14px; }
            pre { background-color: #1a1a1a; color: #fff; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 14px; margin: 20px 0; }
            pre code { background-color: transparent; color: inherit; padding: 0; }
            @page { margin: 2cm; @bottom-center { content: counter(page); font-size: 12px; color: #666; } }
          </style>
        </head>
        <body>
          <h1>Question Paper Analysis</h1>
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5 MB!");
        return;
      }
      
      setFileName(file.name);
      const ext = file.name.split('.').pop().toLowerCase();
      
      if (ext === "txt" || ext === "csv") {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFileData(null);
          setFileMimeType("");
          setTextInput(ev.target.result);
        };
        reader.readAsText(file);
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const data = new Uint8Array(ev.target.result);
          // Dynamically import xlsx to keep the initial page fast
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(firstSheet);
          setFileData(null);
          setFileMimeType("");
          setTextInput(csvText);
        };
        reader.readAsArrayBuffer(file);
      } else {
        // PDF, PNG, JPG, JPEG are handled natively by sending Base64 to Gemini
        const reader = new FileReader();
        reader.onload = (ev) => {
           const base64Str = ev.target.result.split(',')[1];
           setFileData(base64Str);
           setFileMimeType(file.type);
           setTextInput(""); 
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!textInput.trim() && !fileData) return;
    setShowResults(true);
    setLoading(true);

    try {
      const res = await api.post("/ai/pyq/analyze", { text: textInput, fileData, fileMimeType });
      // Depending on axios response mapping, check where data sits:
      const result = res.data?.data || res.data;
      
      if (result) {
        setResults(result);
      } else {
        setShowResults(false);
        alert("Failed to analyze the question paper. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setShowResults(false);
      alert(err.response?.data?.message || "Failed to analyze the file. Make sure size is under 5MB.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setResults(null);
    setTextInput("");
    setFileName("");
    setFileData(null);
    setFileMimeType("");
    localStorage.removeItem("csit_pyq_show_results");
    localStorage.removeItem("csit_pyq_results");
  };

  return (
    <DashboardLayout title="PYQ Analyzer">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <PageHeader title="PYQ Analyzer" subtitle="Upload previous year question papers and get AI-powered insights." />

      {!showResults ? (
        <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-dashed border-[#e8612a]/30 text-center w-full">
          <UploadCloud size={56} className="text-[#e8612a] mx-auto mb-4 md:w-16 md:h-16" />
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Upload Question Paper</h3>
          <p className="text-sm text-gray-400 mb-6">Supports .txt, .pdf, .png, .jpg, .csv, .xlsx (&lt;5MB)</p>

          <label className="inline-block px-6 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-all mb-1">
            Choose File
            <input type="file" accept=".txt,.pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
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
        <div className={isFullscreen 
          ? "fixed inset-4 md:inset-8 z-[100] bg-white shadow-2xl rounded-2xl p-6 md:p-10 flex flex-col border border-gray-200 overflow-hidden" 
          : "bg-white rounded-2xl p-5 md:p-6 border border-[#f0ece8] min-h-[400px] max-h-[700px] flex flex-col"
        }>
          <button onClick={handleReset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#e8612a] transition-colors mb-6 w-fit">
            <ArrowLeft size={16} /> Back to upload
          </button>

          {loading || !results ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-1/2 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-semibold text-[#1a1a1a] truncate max-w-[60%]">Analysis Results</h3>
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
              <div id="rendered-pyq-content" className="flex-1 overflow-y-auto pr-2 pb-8 scrollbar-hide">
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
                      li: ({node, ...props}) => <li className="text-gray-600" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-[#1a1a1a]" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#e8612a] pl-4 italic bg-orange-50/50 py-2 rounded-r-lg my-4" {...props} />
                    }}
                  >
                    {results}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PYQAnalyzer;
