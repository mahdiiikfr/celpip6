import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Info,
    Clock,
    Mic,
    Play,
    Pause,
    RefreshCcw,
    Bot,
    XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import AppHeader from '@/components/AppHeader';
import CelpipPlayerView from '@/components/celpip/CelpipPlayerView';
import CelpipResultDialog from '@/components/celpip/CelpipResultDialog';
import { celpipService } from '@/lib/celpipService';
import { AiGradingResult } from '@/types/celpip';

// provided video URL
const URL_VIDEO_INSTRUCTION = "https://s31.uupload.ir/files/mrghooghooli/podcast_memory_bank/speaking_test/CELPIP-G_Speaking.8fe2eeb788c36d596f17.mp4";

// Constants for Dummy Timers (as requested: 5s Prep, 10s Record)
const DUMMY_PREP_TIME = 5;
const DUMMY_RECORD_TIME = 10;

// States equivalent to 'timerState'
type TimerState = 'idle' | 'prep' | 'recording' | 'finished';

interface StepData {
    type: 'intro' | 'video' | 'task';
    title: string;
    title2?: string;
    desc1?: string;
    desc2?: string;
    image?: string;
    prepTime?: number;
    recordTime?: number;
    // For specific task types
    option1?: { img?: string, txt?: string };
    option2?: { img?: string, txt?: string };
    adviceUrl?: string;
    sampleReason1?: string;
    sampleReason2?: string;
    sampleReason3?: string;
}

export default function CelpipSpeakingScreen() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 1. State Management
    const [step, setStep] = useState(0);
    const [stepsData, setStepsData] = useState<StepData[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. Dual-Timer Logic State
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [timeLeft, setTimeLeft] = useState(0);

    // 3. Audio / Speech Recognition
    const [userTranscripts, setUserTranscripts] = useState<Record<number, string>>({});
    const recognitionRef = useRef<any>(null);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);

    // 4. AI Grading
    const [aiResult, setAiResult] = useState<AiGradingResult | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showAiDialog, setShowAiDialog] = useState(false);

    // Derived current step data
    const currentData = stepsData[step] || null;

    useEffect(() => {
        loadData();
        // Check Speech Recognition Support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSpeechSupported(false);
            toast.error("Speech Recognition is not supported in this browser.");
        }
    }, [id, type]);

    const loadData = async () => {
        setLoading(true);
        try {
            const rawData = await celpipService.getSpeakingTest(`speaking test ${id}`);

            const mappedSteps: StepData[] = [];

            // Step 0: Intro (Static)
            mappedSteps.push({
                type: 'intro',
                title: `Practice Test ${type} - Speaking Test`,
                title2: "Speaking Test Instructions",
                desc1: "For this practice test, you should use a headset with a microphone. You should also ensure that you are in a quiet room.",
                desc2: "Try to complete the practice test in one sitting. On the official test, you will not be able to stop the test once you start."
            });

            // Step 1: Video (Static)
            mappedSteps.push({
                type: 'video',
                title: "Speaking Instructional Video"
            });

            const dataIndex = type === "B" ? 1 : 0;
            const taskList = rawData[dataIndex];

            if (Array.isArray(taskList)) {
                if (taskList[0]) mappedSteps.push({ type: 'task', title: taskList[0].txt_title || "Practice Task", title2: taskList[0].txt_title_2 || "", prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[0].url_advice, sampleReason1: taskList[0].sample_season_1, sampleReason2: taskList[0].sample_season_2, sampleReason3: taskList[0].sample_season_3 });
                if (taskList[1]) mappedSteps.push({ type: 'task', title: taskList[1].txt_title, title2: taskList[1].txt_title_2, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[1].url_advice, sampleReason1: taskList[1].sample_season_1, sampleReason2: taskList[1].sample_season_2, sampleReason3: taskList[1].sample_season_3 });
                if (taskList[2]) mappedSteps.push({ type: 'task', title: taskList[2].txt_title, title2: taskList[2].txt_title_2, image: taskList[2].image_view_1, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[2].url_advice, sampleReason1: taskList[2].sample_season_1, sampleReason2: taskList[2].sample_season_2, sampleReason3: taskList[2].sample_season_3 });
                if (taskList[3]) mappedSteps.push({ type: 'task', title: taskList[3].txt_title, title2: taskList[3].txt_title_2, image: taskList[3].image_view_1, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[3].url_advice, sampleReason1: taskList[3].sample_season_1, sampleReason2: taskList[3].sample_season_2, sampleReason3: taskList[3].sample_season_3 });

                if (taskList[5]) mappedSteps.push({ type: 'task', title: taskList[5].txt_title, title2: taskList[5].txt_title_2, desc1: taskList[5].txt_description_1, option1: { img: taskList[5].img_option_1, txt: taskList[5].txt_option_1 }, option2: { img: taskList[5].img_option_2, txt: taskList[5].txt_option_2 }, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME });
                if (taskList[6]) mappedSteps.push({ type: 'task', title: taskList[6].txt_title, title2: taskList[6].txt_title_2, option1: { img: taskList[6].img_option_1, txt: taskList[6].txt_option_1 }, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[6].url_advice, sampleReason1: taskList[6].sample_season_1, sampleReason2: taskList[6].sample_season_2, sampleReason3: taskList[6].sample_season_3 });
                if (taskList[7]) mappedSteps.push({ type: 'task', title: taskList[7].txt_title, title2: taskList[7].txt_title_2, desc1: taskList[7].txt_description_1, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[7].url_advice, sampleReason1: taskList[7].sample_season_1, sampleReason2: taskList[7].sample_season_2, sampleReason3: taskList[7].sample_season_3 });
                if (taskList[8]) mappedSteps.push({ type: 'task', title: taskList[8].txt_title, title2: taskList[8].txt_title_2, desc1: taskList[8].txt_description_1, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[8].url_advice, sampleReason1: taskList[8].sample_season_1, sampleReason2: taskList[8].sample_season_2, sampleReason3: taskList[8].sample_season_3 });
                if (taskList[9]) mappedSteps.push({ type: 'task', title: taskList[9].txt_title, title2: taskList[9].txt_title_2, image: taskList[9].image_view_1, prepTime: DUMMY_PREP_TIME, recordTime: DUMMY_RECORD_TIME, adviceUrl: taskList[9].url_advice, sampleReason1: taskList[9].sample_season_1, sampleReason2: taskList[9].sample_season_2, sampleReason3: taskList[9].sample_season_3 });
            }

            setStepsData(mappedSteps);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load speaking test data.");
        } finally {
            setLoading(false);
        }
    };

    // --- Speech Recognition Logic ---

    const startRecording = () => {
        if (!isSpeechSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            const currentText = finalTranscript + interimTranscript;
            setUserTranscripts(prev => ({ ...prev, [step]: currentText }));
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                toast.error("Microphone permission denied.");
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            console.log("Speech recognition started...");
        } catch (e) {
            console.error("Failed to start speech recognition", e);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            console.log("Speech recognition stopped.");
        }
    };

    // --- AI Grading Logic ---

    const handleAiCheck = async () => {
        const transcript = userTranscripts[step];
        if (!transcript || transcript.trim().length < 5) {
            toast.error("Transcript is too short or empty.");
            return;
        }

        setLoadingAi(true);
        try {
            const s1 = "میخوام نتیجه یک تست اسپیکینگ رو بررسی کنی... تست به این شکله که ما شرایط اسپیکینگ که قراره کاربر انجام بده را به کاربر میدیم و ازش میخواییم که متناسب با شرایطی که ما توضیح دادیم یک متن بعنوان تمرین اسپیکینگ بنویسه و در نهایت متن کاربر را به تو میدیم که بررسی کنی... شرایط اسپیکینگ: ";

            let s2 = "";
            if (currentData) {
                s2 = `${currentData.title2 || ""} \n ${currentData.desc1 || ""} \n ${currentData.desc2 || ""}`;
                if (currentData.option1) s2 += `\n Option 1: ${currentData.option1.txt || ""}`;
                if (currentData.option2) s2 += `\n Option 2: ${currentData.option2.txt || ""}`;
            }

            const s3 = "جوابی که کاربر بعنوان اسپیکینگ نوشته: ";
            const s4 = "میخوام طبق شرایط و جواب (متن) کاربر نتیجه تست را تحلیل کنی و جواب رو به فرمتی که در ادامه میبینی تحویل بدی(خارج از این فرمت هیچ چیز اضافه تری ننویس و جوابت انگلیسی باشه) [{\"overal_score\": \"جواب کاربرو از لحاظ overal بررسی کن بهش یک امتیاز از 1 تا 10 بده مثلا 2\",\"coherance_score\": \"جواب کاربرو از لحاظ coherance بررسی کن بهش یک امتیاز از 1 تا 10 بده مثلا 2\",\"vocabulary_score\": \"جواب کاربرو از لحاظ vocabulary بررسی کن بهش یک امتیاز از 1 تا 10 بده مثلا 2\",\"readability_score\": \"جواب کاربرو از لحاظ readability بررسی کن بهش یک امتیاز از 1 تا 10 بده مثلا 2\",\"fullfilment_score\": \"جواب کاربرو از لحاظ fullfilment بررسی کن بهش یک امتیاز از 1 تا 10 بده مثلا 2\",\"coherance_issue\": \" در صورتی که امتیاز coherance_score کمتر از 10 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"coherance_improve\": \"در صورتی که مقدار coherance_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"coherance_advice\": \"متن کاربرو از لحاظ coherance بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"vocabulary_issue\": \"در صورتی که امتیاز vocabulary_score کمتر از 10 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"vocabulary_improve\": \"در صورتی که مقدار vocabulary_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"vocabulary_advice\": \"متن کاربرو از لحاظ vocabulary بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"readability_issue\": \" در صورتی که امتیاز readability_score کمتر از 10 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"readability_improve\": \"در صورتی که مقدار readability_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"readability_advice\": \"متن کاربرو از لحاظ readability بررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"fullfilment_issue\": \" در صورتی که امتیاز fullfilment_score کمتر از 10 شد مشکل متن کاربرو در این مورد به صورت خلاصه بیان کن در غیر این صورت این رشته خالی بمونه\",\"fullfilment_improve\": \"در صورتی که مقدار fullfilment_issue خالی نبود راه حل مشکلو اینجا به طور خلاصه بیان کن\",\"fullfilment_advice\": \"متن کاربرو از لحاظ fullfilmentبررسی کن و یک مورد بعنوان advice اینجا به طور خلاصه بیان کن\",\"advice\": \"متن جواب کاربرو کامل بررسی کن و یک مورد به طور خلاصه بعنوان advice اینجا بیان کن\",\"Score Improvement Tips\": \"متن جواب کاربرو کامل بررسی کن و یک مورد به طور خلاصه بعنوان Score Improvement Tips اینجا بیان کن\",\"revise_version\": \"اینجا نسخه اصلاح شده متن کاربر را بنویس\"}]";

            const finalPrompt = `${s1}\n${s2}\n${s3}\n${transcript}\n${s4}`;

            const result = await celpipService.submitAiGrading(finalPrompt);
            if (result) {
                setAiResult(result);
                setShowAiDialog(true);
            } else {
                toast.error("AI analysis failed.");
            }
        } catch (e) {
            console.error("AI Grading Error", e);
            toast.error("Failed to analyze speech.");
        } finally {
            setLoadingAi(false);
        }
    };

    // --- Timer Logic (Updated) ---

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timerState === 'prep' || timerState === 'recording') {
            if (timeLeft > 0) {
                interval = setInterval(() => {
                    setTimeLeft((prev) => prev - 1);
                }, 1000);
            } else {
                if (timerState === 'prep') {
                    setTimerState('recording');
                    setTimeLeft(currentData?.recordTime || DUMMY_RECORD_TIME);
                    startRecording();
                } else if (timerState === 'recording') {
                    stopRecording();
                    setTimerState('finished');
                }
            }
        }

        return () => clearInterval(interval);
    }, [timerState, timeLeft, currentData]);

    useEffect(() => {
        if (currentData?.type === 'task') {
            setTimerState('prep');
            setTimeLeft(currentData.prepTime || DUMMY_PREP_TIME);
            setUserTranscripts(prev => ({ ...prev, [step]: "" }));
        } else {
            setTimerState('idle');
            setTimeLeft(0);
        }
    }, [step, currentData]);

    const handleNext = async () => {
        if (timerState === 'recording') {
            stopRecording();
            setTimerState('finished');
        }

        const nextStepIndex = step + 1;
        if (nextStepIndex < stepsData.length) {
            setStep(prev => prev + 1);
        } else {
            navigate(-1);
        }
    };

    const handleBack = () => {
        if (timerState === 'recording') {
            stopRecording();
        }
        if (step > 0) {
            setStep(prev => prev - 1);
        } else {
            navigate(-1);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const recordProgress = timerState === 'recording'
        ? (( (currentData?.recordTime || DUMMY_RECORD_TIME) - timeLeft) / (currentData?.recordTime || DUMMY_RECORD_TIME)) * 100
        : (timerState === 'finished' ? 100 : 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-gray-500 font-bold">Loading Speaking Test...</p>
                 </div>
            </div>
        );
    }

    if (!currentData) return <div>Error loading data</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
            <AppHeader
                title="Speaking Test"
                leftAction={
                    <button onClick={handleBack} className="text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                }
            />

            <div className="px-4 -mt-6 z-20 relative">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
                    <h2 className="text-center font-bold text-gray-900 text-lg border-b border-gray-50 pb-2 mb-2">
                        {currentData.title}
                    </h2>

                    <div className="flex justify-between items-center">
                         <button
                            onClick={handleNext}
                            className="bg-amber-500 text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-amber-600 transition-colors"
                        >
                            {step === stepsData.length - 1 ? "Finish" : (timerState === 'recording' ? "Stop & Next" : "Next")}
                        </button>

                        <div className="flex flex-col items-end" dir="ltr">
                            <div className={`flex items-center gap-2 transition-opacity duration-300 ${timerState === 'prep' ? 'opacity-100' : 'opacity-40'}`}>
                                <span className={`font-mono font-bold text-lg ${timerState === 'prep' ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {timerState === 'prep' ? formatTime(timeLeft) : formatTime(currentData.prepTime || DUMMY_PREP_TIME)}
                                </span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Preparation</span>
                            </div>

                            <div className={`flex items-center gap-2 mt-1 transition-opacity duration-300 ${timerState === 'recording' ? 'opacity-100' : 'opacity-40'}`}>
                                <span className={`font-mono font-bold ${timerState === 'recording' ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>
                                    {timerState === 'recording' ? timeLeft : (currentData.recordTime || DUMMY_RECORD_TIME)}
                                </span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Recording</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32" dir="ltr">
                {currentData.type === 'intro' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 px-2 mb-4">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-gray-700 text-sm">
                                {currentData.title2}
                            </h3>
                        </div>
                        <div className="space-y-4 px-2">
                             <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                {currentData.desc1}
                             </p>
                             <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                {currentData.desc2}
                             </p>
                        </div>
                    </div>
                )}

                {currentData.type === 'video' && (
                    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-black animate-in zoom-in duration-300">
                        <CelpipPlayerView
                            src={URL_VIDEO_INSTRUCTION}
                            autoPlay={false}
                            className="w-full aspect-video"
                        />
                    </div>
                )}

                {currentData.type === 'task' && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                             <h3 className="font-bold text-gray-800 text-lg mb-2">{currentData.title2}</h3>
                             {currentData.desc1 && (
                                 <p className="text-gray-600 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{currentData.desc1}</p>
                             )}
                             {currentData.image && (
                                 <div className="rounded-lg overflow-hidden border border-gray-100 mt-2">
                                     <img src={currentData.image} alt="Task Scene" className="w-full h-auto object-cover" />
                                 </div>
                             )}
                             {currentData.option1 && (
                                 <div className="space-y-4 mt-4">
                                     <div className={`p-3 rounded-xl border ${currentData.option2 ? 'border-gray-200' : 'border-blue-200 bg-blue-50'}`}>
                                         {currentData.option1.img && (
                                             <img src={currentData.option1.img} alt="Option 1" className="w-full h-32 object-cover rounded-lg mb-2" />
                                         )}
                                         <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">{currentData.option1.txt}</p>
                                     </div>
                                     {currentData.option2 && (
                                        <div className="p-3 rounded-xl border border-gray-200">
                                            {currentData.option2.img && (
                                                <img src={currentData.option2.img} alt="Option 2" className="w-full h-32 object-cover rounded-lg mb-2" />
                                            )}
                                            <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">{currentData.option2.txt}</p>
                                        </div>
                                     )}
                                 </div>
                             )}
                         </div>

                        <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${timerState === 'recording' ? 'border-red-200 ring-2 ring-red-50' : 'border-gray-200'}`}>
                            {timerState === 'prep' && (
                                <div className="p-6 border-b border-gray-100 bg-blue-50/30 animate-in fade-in">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Clock className="w-10 h-10 text-blue-500 animate-bounce" />
                                        <span className="font-bold text-blue-700 text-sm">Preparation Time</span>
                                        <span className="font-mono font-bold text-4xl text-gray-900">{timeLeft}</span>
                                    </div>
                                </div>
                            )}

                            {(timerState === 'recording' || timerState === 'finished') && (
                                <div className="p-6 bg-white animate-in slide-in-from-bottom">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-3 rounded-full border shadow-sm transition-colors ${timerState === 'recording' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                                            <Mic className={`w-6 h-6 ${timerState === 'recording' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                 <span className={`text-xs font-bold uppercase ${timerState === 'recording' ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {timerState === 'recording' ? 'Recording...' : 'Finished'}
                                                 </span>
                                                 <span className="text-xs font-mono text-gray-400">
                                                    {timerState === 'recording' ? timeLeft : 0}s left
                                                 </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ease-linear ${timerState === 'recording' ? 'bg-red-500' : 'bg-gray-400'}`}
                                                    style={{ width: `${recordProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                     {timerState === 'recording' && (
                                         <div className="flex justify-center items-end gap-1 h-8 mb-4 opacity-50">
                                            {[...Array(15)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-red-400 rounded-full animate-pulse"
                                                    style={{
                                                        height: `${Math.random() * 100}%`,
                                                        animationDelay: `${i * 0.05}s`
                                                    }}
                                                ></div>
                                            ))}
                                         </div>
                                     )}

                                     <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 min-h-[60px] italic">
                                        {userTranscripts[step] || (timerState === 'recording' ? "Listening..." : "Recording finished.")}
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                 <p className="text-xs font-bold text-gray-300 text-center mt-8">
                    This playbar will not appear in the official test.
                </p>
            </div>

            <div className="bg-white border-t border-gray-200 p-4 rounded-t-3xl shadow-sm z-30" dir="ltr">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {currentData?.sampleReason1 && currentData.sampleReason1 !== "0" && (
                         <button className="flex-shrink-0 bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-sm">
                            Sample Reason
                        </button>
                    )}
                    {currentData?.adviceUrl && (
                        <button className="flex-shrink-0 bg-amber-400 text-gray-900 font-bold py-2 px-4 rounded-lg text-sm shadow-sm">
                            Advice
                        </button>
                    )}
                </div>

                {timerState === 'finished' && userTranscripts[step] && (
                    <button
                        onClick={handleAiCheck}
                        disabled={loadingAi}
                        className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-sm shadow-sm mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loadingAi ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Analyzing Speech...
                            </>
                        ) : (
                            <>
                                <Bot className="w-5 h-5" />
                                Check with AI
                            </>
                        )}
                    </button>
                )}

                <div className="flex justify-between items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg text-sm shadow-sm transition-colors"
                    >
                        Back
                    </button>

                    {timerState === 'finished' && (
                        <button className="bg-gray-100 text-gray-500 font-bold py-2 px-4 rounded-lg text-sm shadow-sm">
                             Retry
                        </button>
                    )}
                </div>
            </div>

            {aiResult && (
                <CelpipResultDialog
                    isOpen={showAiDialog}
                    onClose={() => setShowAiDialog(false)}
                    title="Speaking Analysis"
                    aiResult={aiResult}
                />
            )}
        </div>
    );
}
