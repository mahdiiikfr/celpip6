import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import CelpipPlayerView from '@/components/celpip/CelpipPlayerView';
import AppHeader from '@/components/AppHeader';
import { celpipService } from '@/lib/celpipService';
import { toast } from 'sonner';
import CelpipListeningResultDialog, { ListeningResultItem } from '@/components/celpip/CelpipListeningResultDialog';

// Placeholder URL provided by user (for fallback/static parts)
const VIDEO_URL = "https://s5.uupload.ir/files/mrghooghooli/podcast_memory_bank/listening_test/CELPIP-G_Listening.mp4";

export default function CelpipListeningScreen() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();

    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [counterQuestions, setCounterQuestions] = useState(0); // Step tracker
    const [timer, setTimer] = useState(0); // Countdown timer
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // User answers map

    // Data Storage
    const [textsList, setTextsList] = useState<string[]>([]);
    const [typesList, setTypesList] = useState<string[]>([]);
    const [titlesList, setTitlesList] = useState<string[]>([]);

    // Scoring Data
    const [questionsList, setQuestionsList] = useState<string[]>([]);
    const [answerKeysList, setAnswerKeysList] = useState<string[]>([]);

    // Navigation History for Dynamic Steps
    const [counterIndex, setCounterIndex] = useState(16); // Starts after static data
    const [previousIndices, setPreviousIndices] = useState<number[]>([]);

    // Result Dialog State
    const [showResult, setShowResult] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [resultItems, setResultItems] = useState<ListeningResultItem[]>([]);

    // --- Initial Load ---
    useEffect(() => {
        loadData();
    }, [id, type]);

    // --- Timer Logic ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Initial Static Data (Steps 0-1) - Matches Kotlin `setList`
            const initialTexts = [
                `Practice Test ${type} - Listening Test`, // 0
                "Listening Test Instructions", // 1
                `On the official test, once you leave a page, you cannot go back to it to change your answers. However, in this sample test, you can.
Please note that the order of question types on the official test may differ from the order presented here.
This Listening Test is identical in format to the official test except that the Listening section of the official test may be slightly longer as it might contain additional questions included for research and development purposes.`, // 2
                "For more information on test format, click here.", // 3
                "Listening Instructional Video" // 4
            ];

            const initialTitles = [
                `Practice Test ${type} - Listening Test`, // 0
                "Listening Instructional Video" // 1
            ];

            // 2. Fetch Remote Data
            const rawData = await celpipService.getTestContent(`listening test ${id}`);
            const { newTexts, newTypes, newTitles, newQuestions, newAnswerKeys } = parseRemoteData(rawData, type || "A");

            setTextsList([...initialTexts, ...newTexts]);
            setTypesList(newTypes);
            setTitlesList([...initialTitles, ...newTitles]);

            // Add Static Question placeholders if needed to align indices?
            // No, questionsList stores actual questions for scoring dialog.
            // Kotlin adds "Practice Test 1 - Listening Practice Task - Q 1" manually?
            // "questionsList.add("Practice Test 1 - Listening Practice Task - Q 1")" in `parcelJsonDataCelpip`
            // My `parseRemoteData` should handle this.
            setQuestionsList(newQuestions);
            setAnswerKeysList(newAnswerKeys);

            setLoading(false);
        } catch (e) {
            console.error("Failed to load listening test", e);
            toast.error("Failed to load test data. Please try again.");
            setLoading(false);
        }
    };

    const parseRemoteData = (jsonArray: any[], testType: string) => {
        const newTexts: string[] = [];
        const newTypes: string[] = [];
        const newTitles: string[] = [];
        const newQuestions: string[] = [];
        const newAnswerKeys: string[] = [];

        const add = (val: any) => newTexts.push(val ? String(val) : "");

        try {
            if (!jsonArray || jsonArray.length === 0) return { newTexts, newTypes, newTitles, newQuestions, newAnswerKeys };
            const testContent = jsonArray[0].test_content;

            let mainArray;
            try {
                 mainArray = JSON.parse(testContent);
                 if (typeof mainArray === 'string') mainArray = JSON.parse(mainArray);
            } catch (e) {
                 console.warn("Simple parse failed, trying sanitization", e);
                 const sanitized = testContent.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
                 mainArray = JSON.parse(sanitized);
            }

            const index = testType === "B" ? 1 : 0;
            const innerArray = mainArray[index];

            // Kotlin Manual Add
            newQuestions.push(`Practice Test ${id} - Listening Practice Task - Q 1`);

            innerArray.forEach((obj: any) => {
                if (obj.type) newTypes.push(obj.type);

                let txtTitle = "0";
                if (obj.txt_title) txtTitle = obj.txt_title;
                newTitles.push(txtTitle);

                // Text Pushing Logic
                if (obj.txt_title_2) add(obj.txt_title_2);
                if (obj.txt_description_1) add(obj.txt_description_1);
                if (obj.txt_description_2) add(obj.txt_description_2);
                if (obj.audio_link) add(obj.audio_link);
                if (obj.transcript) {
                    add(obj.transcript);
                    if (obj.txt_title_3) {
                        // Kotlin logic: adds transcript to questions list if txt_title_3 exists?
                        // "questionsList.add(transcript)"
                        newQuestions.push(obj.transcript);
                    }
                }
                if (obj.txt_title_3) add(obj.txt_title_3);

                if (obj.rdb_1) add(obj.rdb_1);
                if (obj.rdb_2) add(obj.rdb_2);
                if (obj.rdb_3) add(obj.rdb_3);
                if (obj.rdb_4) add(obj.rdb_4);

                if (obj.answer) {
                    add(obj.answer);
                    newAnswerKeys.push(obj.answer);
                }

                if (obj.txt_description_3) add(obj.txt_description_3);
                if (obj.image_view_1) add(obj.image_view_1);

                // Questions Loop (1-8)
                const checkAndAddQ = (qKey: string, ansKey: string) => {
                    if (obj[qKey]) {
                        add(obj[qKey]);
                        newQuestions.push(obj[qKey]);
                    }
                    // Options handled in main sequence below
                };

                // We must follow exact PUSH order to textsList
                if (obj.txt_question_1) { add(obj.txt_question_1); newQuestions.push(obj.txt_question_1); }
                if (obj.options_1_1) add(obj.options_1_1);
                if (obj.options_1_2) add(obj.options_1_2);
                if (obj.options_1_3) add(obj.options_1_3);
                if (obj.options_1_4) add(obj.options_1_4);
                if (obj.answer_1) { add(obj.answer_1); newAnswerKeys.push(obj.answer_1); }

                if (obj.txt_question_2) { add(obj.txt_question_2); newQuestions.push(obj.txt_question_2); }
                if (obj.options_2_1) add(obj.options_2_1);
                if (obj.options_2_2) add(obj.options_2_2);
                if (obj.options_2_3) add(obj.options_2_3);
                if (obj.options_2_4) add(obj.options_2_4);
                if (obj.answer_2) { add(obj.answer_2); newAnswerKeys.push(obj.answer_2); }

                if (obj.txt_question_3) { add(obj.txt_question_3); newQuestions.push(obj.txt_question_3); }
                if (obj.options_3_1) add(obj.options_3_1);
                if (obj.options_3_2) add(obj.options_3_2);
                if (obj.options_3_3) add(obj.options_3_3);
                if (obj.options_3_4) add(obj.options_3_4);
                if (obj.answer_3) { add(obj.answer_3); newAnswerKeys.push(obj.answer_3); }

                if (obj.txt_question_4) { add(obj.txt_question_4); newQuestions.push(obj.txt_question_4); }
                if (obj.options_4_1) add(obj.options_4_1);
                if (obj.options_4_2) add(obj.options_4_2);
                if (obj.options_4_3) add(obj.options_4_3);
                if (obj.options_4_4) add(obj.options_4_4);
                if (obj.answer_4) { add(obj.answer_4); newAnswerKeys.push(obj.answer_4); }

                if (obj.txt_question_5) { add(obj.txt_question_5); newQuestions.push(obj.txt_question_5); }
                if (obj.options_5_1) add(obj.options_5_1);
                if (obj.options_5_2) add(obj.options_5_2);
                if (obj.options_5_3) add(obj.options_5_3);
                if (obj.options_5_4) add(obj.options_5_4);
                if (obj.answer_5) { add(obj.answer_5); newAnswerKeys.push(obj.answer_5); }

                if (obj.txt_question_6) { add(obj.txt_question_6); newQuestions.push(obj.txt_question_6); }
                if (obj.options_6_1) add(obj.options_6_1);
                if (obj.options_6_2) add(obj.options_6_2);
                if (obj.options_6_3) add(obj.options_6_3);
                if (obj.options_6_4) add(obj.options_6_4);
                if (obj.answer_6) { add(obj.answer_6); newAnswerKeys.push(obj.answer_6); }

                if (obj.txt_question_7) { add(obj.txt_question_7); newQuestions.push(obj.txt_question_7); }
                if (obj.options_7_1) add(obj.options_7_1);
                if (obj.options_7_2) add(obj.options_7_2);
                if (obj.options_7_3) add(obj.options_7_3);
                if (obj.options_7_4) add(obj.options_7_4);
                if (obj.answer_7) { add(obj.answer_7); newAnswerKeys.push(obj.answer_7); }

                if (obj.txt_question_8) { add(obj.txt_question_8); newQuestions.push(obj.txt_question_8); }
                if (obj.options_8_1) add(obj.options_8_1);
                if (obj.options_8_2) add(obj.options_8_2);
                if (obj.options_8_3) add(obj.options_8_3);
                if (obj.options_8_4) add(obj.options_8_4);
                if (obj.answer_8) { add(obj.answer_8); newAnswerKeys.push(obj.answer_8); }
            });

        } catch (e) {
            console.error("Parse Error", e);
        }
        return { newTexts, newTypes, newTitles, newQuestions, newAnswerKeys };
    };

    // --- Helpers ---
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleAnswer = (key: string, value: string) => {
        // key is the "Correct Answer" text (from API)
        setUserAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleResult = () => {
        // Calculate Score
        let correctCount = 0;
        const results: ListeningResultItem[] = [];

        // We assume answerKeysList and questionsList are aligned in logic
        // Kotlin: generateData() manually builds list?
        // It iterates 38 times? "return testsResList".
        // It seems Kotlin hardcodes the sequence or assumes strict alignment.
        // My `questionsList` and `answerKeysList` should be same length?
        // Let's iterate min length.

        const count = Math.min(questionsList.length, answerKeysList.length);

        for (let i = 0; i < count; i++) {
            const question = questionsList[i];
            const correctAnswer = answerKeysList[i];
            const userAnswer = userAnswers[correctAnswer] || "-"; // Default to "-"

            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correctCount++;

            results.push({
                question,
                correctAnswer,
                userAnswer,
                isCorrect
            });
        }

        setFinalScore(correctCount);
        setResultItems(results);
        setShowResult(true);
    };

    const handleNext = () => {
        if (loading) return;

        if (counterQuestions < 3) {
            setCounterQuestions(prev => prev + 1);
            if (counterQuestions === 2) {
                setCounterIndex(16);
            }
            return;
        }

        const typeIndex = counterQuestions - 4;
        if (typeIndex >= typesList.length) {
            handleResult();
            return;
        }

        const currentType = typesList[typeIndex];
        const consumed = getConsumedCount(currentType);

        setPreviousIndices(prev => [...prev, counterIndex]);
        setCounterIndex(prev => prev + consumed);
        setCounterQuestions(prev => prev + 1);

        setTimer(0);
    };

    const handleBack = () => {
        if (counterQuestions > 0) {
            if (counterQuestions > 4) {
                const prev = previousIndices[previousIndices.length - 1];
                setCounterIndex(prev);
                setPreviousIndices(old => old.slice(0, -1));
            }
            setCounterQuestions(prev => prev - 1);
            setTimer(0);
        } else {
            navigate(-1);
        }
    };

    const getConsumedCount = (type: string) => {
        if (type === "type_1") return 3;
        if (type === "type_2") return 2;
        if (type === "type_3") return 3;
        if (type === "type_4") return 9;
        if (type === "type_5") return 1;
        if (type === "type_6") return 2;
        if (type === "type_7") return 49;
        if (type === "type_8") return 3;
        if (type === "type_9") return 49;
        if (type === "type_10") return 37;
        return 0;
    };


    // --- Render Logic ---
    const renderContent = () => {
        if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Test Data...</div>;
        if (textsList.length === 0) return <div className="p-10 text-center text-red-500">No Data Available</div>;

        if (counterQuestions === 0) {
            return (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-2 text-blue-700">
                        <div className="p-1 bg-blue-50 rounded-full">
                             <Info className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-sm text-blue-900">{textsList[1]}</h2>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <p className="text-sm text-slate-700 leading-relaxed font-medium text-justify bg-white p-3 rounded-lg border border-gray-100 shadow-sm whitespace-pre-line">
                        {textsList[2]}
                    </p>
                    <p className="text-xs text-blue-600 underline cursor-pointer">{textsList[3]}</p>
                </div>
            );
        }

        if (counterQuestions === 1) {
            return (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="font-bold text-lg text-slate-800">{textsList[4]}</h2>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black aspect-video">
                        <CelpipPlayerView src={VIDEO_URL} autoPlay={true} />
                    </div>
                </div>
            );
        }

        if (counterQuestions === 2) {
             if (timer === 0) setTimer(30);
             const title2 = textsList[5];
             const audio = textsList[6];
             const title3 = textsList[7];
             const opts = [textsList[8], textsList[9], textsList[10], textsList[11]];
             const ansKey = textsList[12];

            return (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="font-bold text-lg text-slate-800">{title2}</h2>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                        <CelpipPlayerView src={audio} autoPlay={false} />
                    </div>

                    <div className="h-px bg-gray-200 my-2" />

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                         <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <div className="p-1 bg-white rounded-full shadow-sm">
                                <Info className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm">{title3}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
                            {opts.map((opt, idx) => (
                                <label key={idx} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition border ${userAnswers[ansKey] === opt ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'} group`}>
                                    <input
                                        type="radio"
                                        name={ansKey}
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
                                        checked={userAnswers[ansKey] === opt}
                                        onChange={() => handleAnswer(ansKey, opt)}
                                    />
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700 transition">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 font-bold px-1 text-center">
                        This playbar will not appear in the official test.
                    </p>
                </div>
            );
        }

        if (counterQuestions === 3) {
            return (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 text-blue-700">
                        <div className="p-1 bg-blue-50 rounded-full">
                             <Info className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-sm text-blue-900">{textsList[13]}</h2>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                     <p className="text-sm text-slate-700 leading-relaxed font-medium text-justify bg-white p-3 rounded-lg border border-gray-100 shadow-sm whitespace-pre-line">
                        {textsList[14]}
                    </p>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                        <CelpipPlayerView src={textsList[15]} autoPlay={true} />
                    </div>
                </div>
            );
        }

        if (counterQuestions >= 4) {
             const typeIndex = counterQuestions - 4;
             if (typeIndex >= typesList.length) return <div>End of Test</div>;

             const currentType = typesList[typeIndex];
             return renderDynamicContent(currentType, counterIndex, textsList, userAnswers, handleAnswer);
        }

        return null;
    };

    const getHeaderTitle = () => {
        if (counterQuestions === 0) return textsList[0] || "Listening Test";
        if (counterQuestions === 1) return textsList[4] || "Listening Test";
        if (counterQuestions < titlesList.length && titlesList[counterQuestions] && titlesList[counterQuestions] !== "0") {
            return titlesList[counterQuestions];
        }
        return "Listening Test";
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans" dir="rtl">
            <div className="shrink-0 relative z-20">
                <AppHeader title="" />
            </div>

            <div className="mx-4 mt-20 mb-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm relative z-10 transition-all duration-300">
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-800 transition-all duration-300">
                        {getHeaderTitle()}
                    </h1>

                    <div className="flex items-center justify-between w-full px-2" dir="ltr">
                         <div className={`flex items-center gap-2 text-slate-800 font-bold bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 transition-opacity duration-300 ${timer > 0 ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-sm text-slate-500 font-medium">Time remaining</span>
                            <span className="text-lg text-amber-600 font-mono">{formatTime(timer)}</span>
                         </div>

                         <button
                            onClick={handleNext}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition text-sm active:scale-95"
                         >
                            {counterQuestions >= 4 && (counterQuestions - 4) >= (typesList.length - 1) ? "Show Result" : "Next"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 relative" dir="ltr">
                {renderContent()}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0">
                <button
                    onClick={handleBack}
                    disabled={counterQuestions === 0}
                    className={`bg-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-rose-600 transition flex items-center gap-2 active:scale-95 ${counterQuestions === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Back
                </button>

                <button
                    onClick={handleResult}
                    className={`bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-blue-700 transition flex items-center gap-2 active:scale-95 ${counterQuestions < 4 ? 'hidden' : ''}`}
                >
                    Show Result
                </button>
            </div>

            <CelpipListeningResultDialog
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                score={finalScore}
                totalQuestions={questionsList.length}
                results={resultItems}
            />
        </div>
    );
}

function renderDynamicContent(type: string, idx: number, list: string[], answers: any, onAnswer: any) {
    let i = idx;

    if (type === "type_1") {
        // i=Title2, i+1=Desc1, i+2=Audio
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <p className="text-sm text-slate-700 leading-relaxed font-medium text-justify bg-white p-3 rounded-lg border border-gray-100 shadow-sm whitespace-pre-line">{list[i+1]}</p>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                    <CelpipPlayerView src={list[i+2]} autoPlay={false} />
                </div>
            </div>
        );
    }

    if (type === "type_2") {
        // i=Title2, i+1=Image
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
                <img src={list[i+1]} className="w-full rounded-xl shadow-sm border border-gray-100 object-cover" alt="Context" />
            </div>
        );
    }

    if (type === "type_3") {
        // i=Title2, i+1=Audio, i+2=Transcript
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                    <CelpipPlayerView src={list[i+1]} transcript={list[i+2]} autoPlay={false} />
                </div>
            </div>
        );
    }

    if (type === "type_4") {
        const title2 = list[i];
        const audio = list[i+1];
        const transcript = list[i+2];
        const title3 = list[i+3];
        const opts = [list[i+4], list[i+5], list[i+6], list[i+7]];
        const ans = list[i+8];
        const isImg = opts[0] && opts[0].startsWith("http");

        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-bold text-lg text-slate-800">{title2}</h2>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                    <CelpipPlayerView src={audio} transcript={transcript} autoPlay={false} />
                </div>

                <div className="h-px bg-gray-200 my-2" />

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                     <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <div className="p-1 bg-white rounded-full shadow-sm">
                            <Info className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm">{title3}</h3>
                    </div>

                    <div className={isImg ? "grid grid-cols-2 gap-4" : "bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3"}>
                        {opts.map((opt, idx) => (
                            <label key={idx} className={`flex flex-col gap-2 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition border ${answers[ans] === opt ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'} group relative`}>
                                <input
                                    type="radio"
                                    name={ans}
                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600 absolute top-4 left-4 z-10"
                                    checked={answers[ans] === opt}
                                    onChange={() => onAnswer(ans, opt)}
                                />
                                {isImg ? (
                                    <img src={opt} className="w-full h-32 object-cover rounded-md" alt={`Option ${idx+1}`} />
                                ) : (
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700 transition pl-8">{opt}</span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (type === "type_5") {
        // i=Title2
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
            </div>
        );
    }

    if (type === "type_6") {
        // i=Title2, i+1=Desc1
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <p className="text-sm text-slate-700 leading-relaxed font-medium text-justify bg-white p-3 rounded-lg border border-gray-100 shadow-sm whitespace-pre-line">{list[i+1]}</p>
            </div>
        );
    }

    if (type === "type_7" || type === "type_9") {
        const title2 = list[i++];
        const questions = [];
        for (let k = 0; k < 8; k++) {
            const q = list[i++];
            const o = [list[i++], list[i++], list[i++], list[i++]];
            const a = list[i++];
            questions.push({ q, o, a });
        }

        return (
            <div className="space-y-6 pt-2 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{title2}</h2>
                </div>

                {questions.map((item, k) => (
                    <div key={k} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-slate-800 mb-3 text-sm">{item.q}</p>
                        <div className="relative">
                            <select
                                className="w-full p-3 pr-8 border border-gray-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:border-blue-400 transition"
                                value={answers[item.a] || ""}
                                onChange={(e) => onAnswer(item.a, e.target.value)}
                            >
                                <option value="" disabled>Select Answer...</option>
                                {item.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "type_8") {
        // i=Title2, i+1=Audio, i+2=Transcript
        return (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{list[i]}</h2>
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                    <CelpipPlayerView src={list[i+1]} transcript={list[i+2]} autoPlay={false} />
                </div>
            </div>
        );
    }

    if (type === "type_10") {
        const title2 = list[i++];
        const questions = [];
        for (let k = 0; k < 6; k++) {
            const q = list[i++];
            const o = [list[i++], list[i++], list[i++], list[i++]];
            const a = list[i++];
            questions.push({ q, o, a });
        }

        return (
            <div className="space-y-6 pt-2 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-blue-700 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b">
                    <div className="p-1 bg-blue-50 rounded-full"><Info className="w-5 h-5" /></div>
                    <h2 className="font-bold text-sm text-blue-900">{title2}</h2>
                </div>

                {questions.map((item, k) => (
                    <div key={k} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-slate-800 mb-3 text-sm">{item.q}</p>
                        <div className="relative">
                            <select
                                className="w-full p-3 pr-8 border border-gray-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:border-blue-400 transition"
                                value={answers[item.a] || ""}
                                onChange={(e) => onAnswer(item.a, e.target.value)}
                            >
                                <option value="" disabled>Select Answer...</option>
                                {item.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">Content type {type} not yet fully implemented in UI</div>;
}
