
import React, { useState, useRef } from 'react';
import { 
  Wrench, 
  Search, 
  Cpu, 
  CheckCircle2, 
  CircleDot, 
  Sparkles,
  Loader2,
  ChevronRight,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Camera,
  X,
  RotateCcw,
  Zap
} from 'lucide-react';
import { getDiagnosticHelp, getVisualDiagnosticHelp, GroundedDiagnosisResult } from '../services/geminiService';

const Troubleshoot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GroundedDiagnosisResult | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access to use visual diagnostics.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !capturedImage) return;

    setIsLoading(true);
    setResult(null);
    try {
      let data: GroundedDiagnosisResult;
      if (capturedImage) {
        const base64Data = capturedImage.split(',')[1];
        data = await getVisualDiagnosticHelp(query || "Analyze this hardware issue.", base64Data, 'image/jpeg');
      } else {
        data = await getDiagnosticHelp(query, useWebSearch);
      }
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4 md:space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-[32px] shadow-sm border border-indigo-100">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Intelligent IT Diagnostics</h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
          Describe your technical issue or snap a photo of the hardware for a visual AI diagnosis.
        </p>
      </div>

      {/* Main Diagnostic Input */}
      <div className="bg-white p-4 md:p-12 rounded-3xl md:rounded-[48px] shadow-xl border border-slate-50 relative overflow-hidden">
        {/* Visual Cue for Camera */}
        {capturedImage && (
          <div className="absolute top-0 right-0 m-4 sm:m-8 z-10 animate-in slide-in-from-right-4">
             <div className="relative group">
               <img src={capturedImage} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform" alt="Captured" />
               <button 
                onClick={() => setCapturedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="relative">
          <div className="relative bg-slate-50/50 rounded-2xl md:rounded-[32px] border border-slate-100 p-4 md:p-8 min-h-[180px] md:min-h-[240px] flex flex-col">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={capturedImage ? "Describe what we see in the photo..." : "E.g. My printer is offline even though it's connected..."}
              className="flex-1 w-full bg-transparent border-none outline-none text-base md:text-2xl font-medium text-slate-700 placeholder:text-slate-300 transition-all resize-none"
            />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  disabled={!!capturedImage}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    useWebSearch 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-white text-slate-400 border border-slate-100'
                  } ${capturedImage ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Search {useWebSearch ? 'ON' : 'OFF'}</span>
                </button>

                <button 
                  type="button"
                  onClick={startCamera}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <Camera className="w-3 h-3" />
                  <span>{capturedImage ? 'Retake' : 'Scan Gear'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!query.trim() && !capturedImage)}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center space-x-3 shadow-lg transition-all active:scale-95 ${
                  isLoading || (!query.trim() && !capturedImage)
                    ? 'bg-indigo-300 text-white opacity-60 cursor-not-allowed' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Solution</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="py-12 text-center animate-pulse space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            {capturedImage ? 'AI is analyzing your hardware scan...' : (useWebSearch ? 'Browsing technical resources...' : 'Processing diagnostic model...')}
          </p>
        </div>
      )}

      {/* Result Cards Section */}
      {result && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-xl">
              <div className="flex items-center justify-between mb-6 md:mb-10">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-none">Resolution Strategy</h3>
                </div>
                {capturedImage && (
                  <div className="hidden sm:flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Visual Assisted
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {result.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => copyToClipboard(step, idx)}
                    className="flex space-x-4 md:space-x-6 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50/50 group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 cursor-pointer"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black text-xs md:text-sm shadow-sm border border-slate-100 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 font-medium text-base md:text-lg leading-relaxed flex-1">{step}</p>
                    <div className="flex-shrink-0 pt-1">
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Web Grounding Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="bg-indigo-50/30 rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-indigo-100">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Verified Web Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-indigo-100 hover:border-indigo-600 transition-all group shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-700 truncate mr-4">{source.title || source.uri}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-6">Probable Causes</h3>
              <ul className="space-y-3">
                {result.possibleCauses.map((cause, idx) => (
                  <li key={idx} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <CircleDot className="w-3 h-3 mt-1 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Confidence Level</p>
               <h4 className="text-xl md:text-2xl font-black mb-6">High-Precision</h4>
               
               <div className="space-y-1 mb-6">
                 <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-2">
                   <span>Complexity</span>
                   <span>{result.estimatedDifficulty}</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      result.estimatedDifficulty === 'Easy' ? 'w-1/3 bg-emerald-500' :
                      result.estimatedDifficulty === 'Medium' ? 'w-2/3 bg-amber-500' :
                      'w-full bg-red-500'
                    }`}></div>
                 </div>
               </div>
               
               <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                Contact Engineer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
           <div className="absolute top-4 sm:top-8 left-0 w-full px-8 flex justify-between items-center text-white">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest">Hardware Scanner</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Point at the component or screen</p>
              </div>
              <button onClick={stopCamera} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                <X className="w-6 h-6" />
              </button>
           </div>

           <div className="relative w-full max-w-2xl aspect-video sm:aspect-[4/3] bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] sm:border-[40px] border-black/20">
                <div className="w-full h-full border-2 border-white/20 rounded-xl flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-indigo-500/50 rounded-full animate-ping"></div>
                </div>
              </div>
           </div>

           <div className="mt-8 sm:mt-12 flex items-center space-x-8">
              <button 
                onClick={stopCamera}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-1 shadow-2xl active:scale-90 transition-all"
              >
                <div className="w-full h-full rounded-full border-4 border-slate-900 bg-white"></div>
              </button>
              <div className="w-12"></div>
           </div>

           <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default Troubleshoot;
