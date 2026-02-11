import React, { useEffect, useRef, useState } from 'react';
import { getLiveClient } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceOrbProps {
  onClose?: () => void;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{buffer: AudioBuffer, time: number}[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  // Animation Refs
  const animationFrameRef = useRef<number>(0);
  const volumeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = async () => {
    if (sessionRef.current) {
        try {
            const session = await sessionRef.current;
            session.close();
        } catch(e) {
            console.error("Error closing session", e);
        }
        sessionRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = getLiveClient();
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputContext = new AudioContextClass({ sampleRate: 16000 });
      const outputContext = new AudioContextClass({ sampleRate: 24000 });
      inputAudioContextRef.current = inputContext;
      outputAudioContextRef.current = outputContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are a billionaire polymath mentor. You mastered Geomatics, Trading, and Cybersecurity. You are the richest person in the world because you optimized your time perfectly. You are talking to a student who wants to be like you. Be inspiring, strategic, a bit demanding but supportive. Speak concisely and confidently.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } 
            }
        },
        callbacks: {
            onopen: () => {
                setStatus('listening');
                setIsActive(true);

                const source = inputContext.createMediaStreamSource(stream);
                const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Simple volume meter for visualizer
                    let sum = 0;
                    for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                    volumeRef.current = Math.sqrt(sum / inputData.length) * 5;

                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputContext.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    setStatus('speaking');
                    const audioBuffer = await decodeAudioData(
                        decode(base64Audio),
                        outputContext,
                        24000,
                        1
                    );
                    
                    const now = outputContext.currentTime;
                    if (nextStartTimeRef.current < now) {
                        nextStartTimeRef.current = now;
                    }

                    const source = outputContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputContext.destination);
                    source.start(nextStartTimeRef.current);
                    
                    nextStartTimeRef.current += audioBuffer.duration;

                    source.onended = () => {
                        if (outputContext.currentTime >= nextStartTimeRef.current - 0.1) {
                            setStatus('listening');
                        }
                    };
                }
            },
            onclose: () => {
                setStatus('idle');
                setIsActive(false);
            },
            onerror: (e) => {
                console.error(e);
                setStatus('idle');
            }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
        console.error("Connection failed", e);
        setStatus('idle');
    }
  };

  // --- Visualizer Logic ---
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 60);
        
        if (status === 'speaking') {
            gradient.addColorStop(0, '#818cf8'); // Indigo 400
            gradient.addColorStop(1, '#312e81'); // Indigo 900
            volumeRef.current = 0.8 + Math.random() * 0.2; 
        } else if (status === 'listening') {
             gradient.addColorStop(0, '#34d399'); // Emerald 400
             gradient.addColorStop(1, '#064e3b'); // Emerald 900
        } else {
             gradient.addColorStop(0, '#94a3b8'); 
             gradient.addColorStop(1, '#0f172a');
        }

        const radius = 40 + (volumeRef.current * 30);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = status === 'listening' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isActive, status]);


  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    const b64 = btoa(binary);
    return {
        data: b64,
        mimeType: 'audio/pcm;rate=16000'
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
     const dataInt16 = new Int16Array(data.buffer);
     const frameCount = dataInt16.length / numChannels;
     const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
     for (let channel = 0; channel < numChannels; channel++) {
         const channelData = buffer.getChannelData(channel);
         for (let i = 0; i < frameCount; i++) {
             channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
         }
     }
     return buffer;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center gap-4">
        {isActive && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl animate-fade-in flex flex-col items-center">
                <div className="relative w-40 h-40">
                    <canvas ref={canvasRef} width={160} height={160} className="w-full h-full" />
                </div>
                <div className="text-center mt-2">
                    <p className="text-white font-bold text-lg">Mentor Orb</p>
                    <p className="text-xs text-indigo-400 uppercase tracking-widest">{status}</p>
                </div>
                <button 
                    onClick={disconnect}
                    className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors"
                >
                    End Session
                </button>
            </div>
        )}

        {!isActive && (
            <button 
                onClick={startSession}
                className="group relative flex items-center justify-center w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-600/30 transition-all hover:scale-110"
            >
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 group-hover:opacity-40"></div>
                <Mic className="w-8 h-8 text-white" />
                <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Speak to Mentor
                </span>
            </button>
        )}
    </div>
  );
};

export default VoiceOrb;