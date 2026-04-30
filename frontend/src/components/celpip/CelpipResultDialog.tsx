import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AiGradingResult } from '@/types/celpip';

export interface StandardResult {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    title?: string;
}

interface CelpipResultDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;

    // Mode 1: Standard (Reading/Listening)
    standardResults?: StandardResult[];

    // Mode 2: AI Grading (Writing/Speaking)
    aiResult?: AiGradingResult;
}

export default function CelpipResultDialog({ isOpen, onClose, title = "Test Results", standardResults, aiResult }: CelpipResultDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />

            {/* Dialog Panel */}
            <div className="bg-white dark:bg-gray-900 w-full sm:w-[90%] max-w-lg max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-xl flex flex-col pointer-events-auto transform transition-transform animate-in slide-in-from-bottom-4">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-20 rounded-t-3xl">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Standard Results (Reading/Listening) */}
                    {standardResults && (
                        <div className="space-y-4">
                            {standardResults.length === 0 ? (
                                <p className="text-center text-gray-500 italic">No results available yet.</p>
                            ) : (
                                standardResults.map((res, idx) => {
                                    const isCorrect = res.userAnswer === res.correctAnswer;
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800'}`}>
                                            {res.title && <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">{res.title}</h4>}
                                            <p className="font-medium text-gray-800 dark:text-white mb-3 text-sm">{res.question}</p>

                                            <div className="flex flex-col gap-2 text-sm">
                                                <div className={`flex items-center gap-2 ${isCorrect ? 'text-green-700 font-bold' : 'text-red-600 font-medium'}`}>
                                                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                    <span>Your Answer: {res.userAnswer || "-"}</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="flex items-center gap-2 text-green-700 font-medium bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mt-1">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Correct Answer: {res.correctAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* AI Results (Writing/Speaking) */}
                    {aiResult && <AiResultView result={aiResult} />}
                </div>
            </div>
        </div>
    );
}

function AiResultView({ result }: { result: AiGradingResult }) {
    const [showFull, setShowFull] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
             {/* Circular Score Overview */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
                {/* Overall (larger or first) */}
                <div className="col-span-2 sm:col-span-1 flex justify-center w-full">
                    <CircularProgress label="Overall" value={Number(result.overal_score) || 0} color="text-blue-600" size="lg" />
                </div>

                {/* Specific Scores */}
                <CircularProgress label="Coherence" value={Number(result.coherance_score) || 0} color="text-indigo-600" />
                <CircularProgress label="Vocabulary" value={Number(result.vocabulary_score) || 0} color="text-purple-600" />
                <CircularProgress label="Readability" value={Number(result.readability_score) || 0} color="text-pink-600" />
                <CircularProgress label="Fulfillment" value={Number(result.fullfilment_score) || 0} color="text-amber-600" />
            </div>

            {/* Revised Version */}
            {result.revise_version && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-sm uppercase flex items-center gap-2 tracking-wide">
                        Revised Version
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-blue-300 pl-3">
                        "{result.revise_version}"
                    </p>
                </div>
            )}

            {/* Detailed Feedback Toggle */}
            <div className="border-t border-gray-100 pt-4">
                <button
                    onClick={() => setShowFull(!showFull)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100 transition-all active:scale-[0.99]"
                >
                    <span>Detailed Feedback</span>
                    {showFull ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFull && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                        {/* General Advice */}
                        <FeedbackSection title="General Advice" content={result.advice} variant="advice" />

                        {/* Coherence */}
                        <FeedbackSection title="Coherence Issues" content={result.coherance_issue} variant="issue" />
                        <FeedbackSection title="Coherence Advice" content={result.coherance_advice} variant="advice" />
                        <FeedbackSection title="Coherence Improve" content={result.coherance_improve} variant="improve" />

                        {/* Vocabulary */}
                        <FeedbackSection title="Vocabulary Issues" content={result.vocabulary_issue} variant="issue" />
                        <FeedbackSection title="Vocabulary Advice" content={result.vocabulary_advice} variant="advice" />
                        <FeedbackSection title="Vocabulary Improve" content={result.vocabulary_improve} variant="improve" />

                        {/* Readability */}
                        <FeedbackSection title="Readability Issues" content={result.readability_issue} variant="issue" />
                        <FeedbackSection title="Readability Advice" content={result.readability_advice} variant="advice" />
                        <FeedbackSection title="Readability Improve" content={result.readability_improve} variant="improve" />

                        {/* Fulfillment */}
                        <FeedbackSection title="Fulfillment Issues" content={result.fullfilment_issue} variant="issue" />
                        <FeedbackSection title="Fulfillment Advice" content={result.fullfilment_advice} variant="advice" />
                        <FeedbackSection title="Fulfillment Improve" content={result.fullfilment_improve} variant="improve" />

                        {/* Tips */}
                        <FeedbackSection title="Improvement Tips" content={result["Score Improvement Tips"]} variant="advice" />
                    </div>
                )}
            </div>
        </div>
    );
}

function CircularProgress({ label, value, max = 12, color = "text-blue-600", size = "md" }: { label: string, value: number, max?: number, color?: string, size?: "md" | "lg" }) {
    const radius = size === "lg" ? 40 : 30;
    const stroke = size === "lg" ? 8 : 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Ensure value is within bounds
    const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), max);
    const strokeDashoffset = circumference - (safeValue / max) * circumference;

    const sizeClass = size === "lg" ? "w-32 h-32" : "w-24 h-24";
    const textClass = size === "lg" ? "text-3xl" : "text-xl";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative flex items-center justify-center ${sizeClass}`}>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    {/* Background Circle */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-gray-100 dark:text-gray-800"
                    />
                    {/* Progress Circle */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`font-black text-gray-800 dark:text-white ${textClass}`}>{safeValue}</span>
                </div>
            </div>
            <span className="text-xs font-bold uppercase text-gray-500 tracking-wider text-center">{label}</span>
        </div>
    );
}

type FeedbackVariant = 'issue' | 'improve' | 'advice';

function FeedbackSection({ title, content, variant = 'advice' }: { title: string, content: string, variant: FeedbackVariant }) {
    if (!content) return null;

    const styles: Record<FeedbackVariant, string> = {
        issue: "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
        improve: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100",
        advice: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
    };

    return (
        <div className={`p-4 rounded-xl border ${styles[variant]} shadow-sm transition-colors`}>
            <h4 className="text-xs font-bold uppercase mb-2 opacity-80 tracking-wide flex items-center gap-2">
                {variant === 'issue' && <XCircle className="w-4 h-4" />}
                {variant === 'improve' && <CheckCircle2 className="w-4 h-4" />}
                {variant === 'advice' && <span className="text-lg leading-none">💡</span>}
                {title}
            </h4>
            <p className="text-sm leading-relaxed font-medium text-justify" dir="auto">{content}</p>
        </div>
    );
}
