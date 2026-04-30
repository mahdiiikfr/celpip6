import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FileText, X } from 'lucide-react';

interface CelpipPlayerViewProps {
    src: string;
    transcript?: string;
    autoPlay?: boolean;
    className?: string;
}

export default function CelpipPlayerView({ src, transcript, autoPlay = false, className = '' }: CelpipPlayerViewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [muted, setMuted] = useState(autoPlay); // Default to muted if autoplay is true

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Ignore AbortError (happens on rapid navigation)
                    if (e.name === 'AbortError' || e.name === 'NotSupportedError') return;

                    console.warn("Autoplay failed, trying muted", e);
                    // If autoplay fails, try forcing mute and playing again
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        setMuted(true);
                        videoRef.current.play().catch(e2 => {
                             if (e2.name !== 'AbortError') console.error("Autoplay muted failed too", e2);
                        });
                    }
                });
            }
        }
    }, [autoPlay, src]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // Unmute when user manually plays if it was muted for autoplay
            if (muted) {
                videoRef.current.muted = false;
                setMuted(false);
            }
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                        if (e.name !== 'AbortError') console.error("Play failed", e);
                        setIsPlaying(false);
                    });
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            if (!isNaN(dur) && dur > 0) {
                setCurrentTime(current);
                setDuration(dur);
                setProgress((current / dur) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        if (videoRef.current) videoRef.current.currentTime = 0;
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Determine if it's an audio or video file based on extension
    // Simple heuristic: if it ends with .mp3/wav/ogg -> Audio, else Video
    const isAudio = src.toLowerCase().endsWith('.mp3') || src.toLowerCase().endsWith('.wav') || src.toLowerCase().endsWith('.ogg');

    if (isAudio) {
        return (
             <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group ${className}`}>
                {/* Audio Element */}
                 <audio
                    ref={videoRef as any}
                    src={src}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    autoPlay={autoPlay}
                    className="hidden" // Hide default controls
                />

                <div className="flex items-center p-3 gap-3">
                    <button
                        onClick={togglePlay}
                        className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full text-white transition-all shadow-sm flex-shrink-0"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <div className="flex-1 flex flex-col justify-center gap-1">
                        {/* Progress Bar */}
                        <div
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative overflow-hidden"
                            onClick={(e) => {
                                if (videoRef.current) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = x / rect.width;
                                    videoRef.current.currentTime = percentage * videoRef.current.duration;
                                }
                            }}
                        >
                            <div
                                className="h-full bg-amber-500 relative transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-mono text-gray-500 dark:text-gray-400 font-medium">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                {/* Transcript Toggle for Audio */}
                {transcript && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="w-full p-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                        </button>
                    </div>
                )}

                {/* Transcript Overlay (Inline for Audio to avoid covering controls) */}
                {showTranscript && transcript && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {transcript}
                    </div>
                )}
             </div>
        )
    }

    return (
        <div className={`bg-black rounded-2xl overflow-hidden shadow-sm border border-gray-800 relative group aspect-video ${className}`}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
                muted={muted}
                // Removed crossOrigin="anonymous" to allow opaque responses from s21.uupload.ir which lacks CORS headers
            />

            {/* Controls Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex flex-col justify-end p-4 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer overflow-hidden">
                    <div
                        className="h-full bg-blue-500 relative"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={togglePlay}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-all"
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>

                    <span className="text-xs font-mono font-medium text-white/90 bg-black/50 px-2 py-1 rounded">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Transcript Toggle */}
            {transcript && (
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors z-10"
                >
                    <FileText className="w-5 h-5" />
                </button>
            )}

            {/* Transcript Overlay */}
            {showTranscript && transcript && (
                <div className="absolute inset-0 bg-black/90 p-6 overflow-y-auto z-20 animate-in fade-in">
                     <button
                        onClick={() => setShowTranscript(false)}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h4 className="text-sm font-bold text-amber-500 uppercase mb-4 sticky top-0 bg-black/90 py-2">Transcript</h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        {transcript}
                    </p>
                </div>
            )}
        </div>
    );
}
