import { useEffect, useState } from "react";
import { TextElement } from "@/ui/components/TextElement";
import { FilePathWithDecisions, FilePathWithImages, PathObject } from "@/types/Path";
import { DecisionButton } from "@/ui/components/DecisionButton";
import { DirectoryAPI } from "@/api/directory";
import { ImageElement } from "@/ui/components/ImageElement";
import { DecisionsAPI } from "@/api/decisions";
import { DecisionData } from "@/types/Decision";
import { getGestureFromFullFilePath } from "@/types/Gesture";
import { MultipleCheckBox } from "../components/MultipleCheckBox";
import Image from "next/image";

const gestureOrder: { [key: string]: number } = {
    "tap": 1,
    "double_tap": 2,
    "long_press": 3,
    "swipe_right": 4,
    "swipe_left": 4,
    "scroll_up": 5,
    "scroll_down": 5,
    "pinch_zoom_in": 6,
    "pinch_zoom_out": 6,
}

function getPath(filePath: string): string {
    return filePath.replace(/\/path\.txt$/, "");
}

export const ScreenshotsByPathView = ({ appName }: { appName: string }) => {
    const [pathObjects, setPathObjects] = useState<Array<PathObject>>([])
    const [currentPathObject, setCurrentPathObject] = useState<PathObject>()
    const [filePathWithImages, setFilePathWithImages] = useState<Array<FilePathWithImages>>([])
    const [filePathWithDecisions, setFilePathWithDecisions] = useState<Array<FilePathWithDecisions>>([])
    // DEBUG: refactor... 우엑
    const [decisionRefreshTrigger, setDecisionRefreshTrigger] = useState(false)


    // paths
    useEffect(() => {
        DirectoryAPI.getPaths(appName).then(setPathObjects)
    }, [])
    useEffect(() => {
        if (pathObjects.length > 0) setCurrentPathObject(pathObjects[0])
    }, [pathObjects])


    // images
    useEffect(() => {
        if (!currentPathObject) return

        setFilePathWithImages([])
        const seen = new Set<string>()

        const fetchAllImages = async () => {
            const promises = currentPathObject.filePaths
                .filter((filePath) => {
                    if (seen.has(filePath)) return false
                    seen.add(filePath)
                    return true
                })
                .map(async (filePath) => {
                    const images = await DirectoryAPI.getImages(getPath(filePath))
                    return { filePath, images }
                })

            const results = await Promise.all(promises)
            setFilePathWithImages(results)
        }
        fetchAllImages()
    }, [currentPathObject])


    // decisions
    useEffect(() => {
        if (currentPathObject) {
            setFilePathWithDecisions([])

            currentPathObject.filePaths.forEach((filePath) => {
                const path = getPath(filePath)
                DecisionsAPI.getDecisions(path).then((decisions) => {
                    setFilePathWithDecisions((prev) => [...prev, { filePath, decisions }])
                })
            })
        }
    }, [currentPathObject, decisionRefreshTrigger])


    // arrow keys
    useEffect(() => {
        window.addEventListener("keydown", handleArrowKeys)

        return () => {
            window.removeEventListener("keydown", handleArrowKeys)
        }
    }, [pathObjects])
    const handleArrowKeys = (event: KeyboardEvent) => {
        event.preventDefault()

        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            setCurrentPathObject((prev) => {
                if (prev) {
                    const index = pathObjects.indexOf(prev)
                    if (index === -1) return prev

                    return event.key === "ArrowDown"
                        ? pathObjects[Math.min(index + 1, pathObjects.length - 1)] // move to next gesture
                        : pathObjects[Math.max(index - 1, 0)] // move to previous gesture
                }
            });
        }
    }

    return <div className="flex flex-col justify-start p-2 bg-gray-50 min-h-screen">
        <div className="flex flex-row gap-3">
            <div className="flex flex-col items-center p-2 w-fit max-h-[80vh] overflow-y-auto bg-gray-200 rounded-xl shadow-sm border border-gray-300">
                {pathObjects.map((obj, index) => {
                    const isActive = obj.content === currentPathObject?.content && obj.screen === currentPathObject?.screen
                    return <div
                        key={`${obj.content}+${obj.screen}+${index}`}
                        onClick={() => setCurrentPathObject(obj)}
                        className={`flex flex-col px-2 py-1 m-0.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-300 ${
                            isActive ? 'bg-blue-500 shadow-md' : 'hover:shadow-sm'
                        }`}
                    >
                        <TextElement
                            fontSize="sm"
                            color={isActive ? 'white' : '#374151'}
                            className={`text-center font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}
                        >{index}</TextElement>
                    </div>
                })}
            </div>

            <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-3 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col gap-2 mb-3 p-2 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex flex-row gap-2 items-start">
                        <TextElement fontSize="sm" className="font-semibold text-gray-600 uppercase tracking-wide">Screen:</TextElement>
                        <TextElement
                            fontSize="sm"
                            color="#374151"
                            className="font-semibold text-left"
                        >{currentPathObject?.screen}</TextElement>
                    </div>
                    <div className="flex flex-row gap-2 items-start">
                        <TextElement fontSize="sm" className="font-semibold text-gray-600 uppercase tracking-wide">Path:</TextElement>
                        <TextElement
                            fontSize="sm"
                            color="#374151"
                            className="break-words max-w-7xl text-left leading-relaxed text-[0.7rem]"
                        >{currentPathObject?.content}</TextElement>
                    </div>
                </div>

                {currentPathObject?.filePaths
                    .sort((a, b) => (gestureOrder[getGestureFromFullFilePath(a)] || 99) - (gestureOrder[getGestureFromFullFilePath(b)] || 99))
                    .map((filePath) => {
                        const temp = filePathWithDecisions.find((item) => item.filePath === filePath)
                        const decisions: Array<DecisionData> = temp?.decisions ?? []
                        const currentGesture = getGestureFromFullFilePath(filePath)


                        return <div
                            key={filePath}
                            className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex flex-row items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold text-sm rounded-full">
                                    {currentGesture}
                                </span>
                                <TextElement
                                    fontSize="sm"
                                    color="#6b7280"
                                    className="font-mono text-left"
                                >{filePath}</TextElement>
                            </div>

                            <div className="flex flex-row gap-6 items-start">
                                {/* Images - all in one row */}
                                <div className="flex flex-row gap-4 flex-wrap">
                                    {filePathWithImages.map((filePathWithImages) => {
                                        if (filePathWithImages.filePath === filePath) {
                                            const isDuringAfterSelectable = currentGesture === 'long_press' || currentGesture.includes('pinch')
                                            
                                            return filePathWithImages.images.map((image, index) => {
                                                const currentDecision = image.path.split('/').pop()?.split('.')[0]
                                                const daDecision = decisions.find((d) => d.type === 'D/A')
                                                const isSelected = isDuringAfterSelectable &&
                                                    daDecision && Array.isArray(daDecision.decision) && daDecision.decision.includes(currentDecision)
                                                const isSelectable = isDuringAfterSelectable && (image.path.includes('during') || image.path.includes('after'))
                                                
                                                return (
                                                    <div key={`${filePath}+${index}`} className="flex flex-col items-center group">
                                                        <div className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${
                                                            isSelected ? 'ring-4 ring-green-400 shadow-green-200' : 
                                                            isSelectable ? 'ring-2 ring-blue-300 hover:ring-blue-400 cursor-pointer' : ''
                                                        }`}>
                                                            <Image
                                                                src={image.path}
                                                                alt={image.path}
                                                                width={200}
                                                                height={200}
                                                                onClick={() => {
                                                                    if (isSelectable) {
                                                                        const newDecisions = decisions.filter((d) => d.type !== 'D/A')
                                                                        const existingDecision = decisions.find((d) => d.type === 'D/A')
                                                                
                                                                        if (existingDecision) {
                                                                            if (existingDecision.decision.includes(currentDecision)) {
                                                                                const updatedDecision = {
                                                                                    type: 'D/A',
                                                                                    decision: existingDecision.decision.filter((d) => d !== currentDecision)
                                                                                }
                                                                                DecisionsAPI.writeDecisions(getPath(filePath), [...newDecisions, updatedDecision])
                                                                                setDecisionRefreshTrigger(prev => !prev)
                                                                            } else {
                                                                                const updatedDecision = {
                                                                                    type: 'D/A',
                                                                                    decision: [...existingDecision.decision, currentDecision]
                                                                                }
                                                                                DecisionsAPI.writeDecisions(getPath(filePath), [...newDecisions, updatedDecision])
                                                                                setDecisionRefreshTrigger(prev => !prev)
                                                                            }
                                                                        } else {
                                                                            const newDecision = { type: 'D/A', decision: [currentDecision] }
                                                                            DecisionsAPI.writeDecisions(getPath(filePath), [...newDecisions, newDecision])
                                                                            setDecisionRefreshTrigger(prev => !prev)
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            {isSelectable && (
                                                                <div className={`absolute top-2 right-2 rounded p-1 ${
                                                                    isSelected 
                                                                        ? 'bg-green-500 text-white' 
                                                                        : 'bg-gray-400 text-white'
                                                                }`}>
                                                                    {isSelected ? (
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <TextElement 
                                                            fontSize="sm" 
                                                            className="mt-2 text-center font-medium text-gray-700"
                                                        >{image.name}</TextElement>
                                                    </div>
                                                )
                                            })
                                        }
                                    })}
                                </div>

                                {/* Decision Panel - on the right side */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-w-fit flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-base font-semibold text-slate-800">Decision Panel</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <DecisionButton
                                            questionText={"Is the interaction correct?"}
                                            storageKey={`${appName}-${filePath}-correctness`}
                                            type={'isCorrect'}
                                            decisions={decisions}
                                            setDecisions={() => setDecisionRefreshTrigger(prev => !prev)}
                                            path={getPath(filePath)}
                                        />
                                        {!['tap', 'double_tap', 'long_press'].includes(currentGesture) &&
                                            <DecisionButton
                                                questionText={"Is it hidden interaction?"}
                                                storageKey={`${appName}-${filePath}-hidden`}
                                                type={'isHidden'}
                                                decisions={decisions}
                                                setDecisions={() => setDecisionRefreshTrigger(prev => !prev)}
                                                path={getPath(filePath)}
                                            />
                                        }
                                        <div className="pt-4 border-t border-gray-100">
                                            <MultipleCheckBox
                                                questionText={"UI elements interacted with"}
                                                storageKey={`${appName}-${filePath}-elements`}
                                                type={'elementType'}
                                                decisions={decisions}
                                                setDecisions={() => setDecisionRefreshTrigger(prev => !prev)}
                                                path={getPath(filePath)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}
