'use client'

import {Sidebar} from "@/ui/components/Sidebar";
import {ScreenshotsByGestureView} from "@/ui/feature/ScreenshotsByGestureView";
import {useCallback, useEffect, useState} from "react";
import {ScreenshotsByPathView} from "@/ui/feature/ScreenshotsByPathView";
import {useRouter, useSearchParams} from "next/navigation";
import {DecisionsAPI} from "@/api/decisions";
import {Decision} from "@/types/Decision";
import {getGestureFromFullFilePath} from "@/types/Gesture";

type Mode = 'gesture' | 'path'

interface AppContainerProps {
    appName: string
}

export const AppContainer = ({ appName }: AppContainerProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams.toString())

    const mode = searchParams.get('mode')

    const [numOfHiddenInteractions, setNumOfHiddenInteractions] = useState<number | undefined>()

    useEffect(() => {
        DecisionsAPI.getAllDecisionFiles(`/${appName}`).then((res) => {
            const len = res
                .map((item) => ({
                    gesture: getGestureFromFullFilePath(item.filePath),
                    decisions: JSON.parse(item.content)
                }))
                .filter(({ gesture, decisions }) => Decision.getDecisionResultByGesture(gesture, decisions))
                .length
            setNumOfHiddenInteractions(len)
        })
    }, []);

    const changeMode = useCallback((newMode: Mode) => {
        params.set('mode', newMode)
        router.replace(`?${params.toString()}`)
    }, [])

    return <div className="flex flex-col w-full h-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen">
        <div className="flex flex-row h-full w-full">
            <div className="flex flex-col w-screen">
                <header className="relative overflow-hidden">
                    <div className="relative bg-white/90z backdrop-blur-xl p-4 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                    <h1 className="text-base font-semibold text-slate-800">
                                        View Mode
                                    </h1>
                                </div>

                                <div className="flex bg-slate-100 rounded-lg p-0.5">
                                    <button
                                        onClick={() => changeMode('gesture')}
                                        className={`px-4 py-1.5 rounded-md font-medium text-xs transition-all ${
                                            mode !== 'path'
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        GESTURE
                                    </button>
                                    <button
                                        onClick={() => changeMode('path')}
                                        className={`px-4 py-1.5 rounded-md font-medium text-xs transition-all ${
                                            mode === 'path'
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        PATH
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-slate-600 text-xs">Results for</span>
                                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs">
                                    {appName}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-lg font-bold text-emerald-600">
                                        {numOfHiddenInteractions || 0}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push('/results')}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                                >
                                    View All Results
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-row flex-1 gap-1">
                    <Sidebar/>
                    <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-tl-3xl shadow-inner border-t border-l border-white/30">
                        {mode === 'path' ?
                            <ScreenshotsByPathView appName={appName}/>
                            :
                            <ScreenshotsByGestureView appName={appName}/>
                        }
                    </div>
                </main>
            </div>
        </div>
    </div>
}
