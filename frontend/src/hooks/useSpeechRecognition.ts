// src/hooks/useSpeechRecognition.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// این interface برای سازگاری با مرورگرهای مختلف است
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// @ts-ignore
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (initialLang: string = 'fa-IR', debug: boolean = false) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const log = useCallback((msg: string) => {
      if (debug) {
          console.log(`[SpeechDebug] ${msg}`);
          toast(msg, { duration: 2000, position: 'top-left' });
      }
  }, [debug]);

  const startListening = useCallback(() => {
    log('Start request received');

    if (!SpeechRecognitionAPI) {
      const msg = t('speech.notSupported', { defaultValue: 'مرورگر شما از قابلیت تشخیص گفتار پشتیبانی نمی‌کند.' });
      setError(msg);
      log('Error: API not found');
      return;
    }

    // Critical for iOS: Cancel any active speech synthesis
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    try {
      // 1. Abort previous instance
      if (recognitionRef.current) {
        try {
            recognitionRef.current.abort();
        } catch(e) {}
      }

      // 2. Create NEW instance
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = initialLang;

      // 3. Bind Events
      recognition.onstart = () => {
        log('Event: onstart - Listening started');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        log('Event: onresult');
        const results = event.results;
        if (results && results.length > 0 && results[0] && results[0].length > 0) {
            const transcript = results[0][0].transcript;
            log(`Transcript: ${transcript}`);
            setText(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        log(`Event: onerror - ${event.error}`);
        console.error("Speech recognition error event:", event);
        let errorMessage = `خطا: ${event.error}`;

        switch (event.error) {
            case 'not-allowed':
            case 'service-not-allowed':
                errorMessage = t('speech.accessDenied', { defaultValue: 'دسترسی مسدود است.' });
                break;
            case 'no-speech':
                errorMessage = t('speech.noSpeech', { defaultValue: 'صدایی شنیده نشد.' });
                break;
            case 'network':
                errorMessage = t('speech.networkError', { defaultValue: 'خطای شبکه.' });
                break;
            case 'aborted':
                errorMessage = '';
                break;
            case 'audio-capture':
                errorMessage = t('speech.micNotFound', { defaultValue: 'میکروفون پیدا نشد.' });
                break;
        }

        if (errorMessage) {
            setError(errorMessage);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        log('Event: onend');
        setIsListening(false);
      };

      // 4. Save ref and Start
      recognitionRef.current = recognition;
      setText('');
      setError(null);

      recognition.start();

    } catch (err: any) {
      console.error("Failed to start recognition:", err);
      const msg = `Exception: ${err.message || err}`;
      log(msg);
      setError(t('speech.startFailed', { defaultValue: 'شروع میکروفون ناموفق بود.' }));
      setIsListening(false);
    }
  }, [initialLang, log, t]);

  const stopListening = useCallback(() => {
    log('Stop request received');
    if (recognitionRef.current) {
      try {
          recognitionRef.current.stop();
      } catch(e) {
          console.warn("Stop failed:", e);
      }
    }
  }, [log]);

  return {
      text,
      isListening,
      error,
      startListening,
      stopListening,
      hasRecognitionSupport: !!SpeechRecognitionAPI
  };
};
