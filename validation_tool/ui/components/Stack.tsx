/**
 * @deprecated Stack components have been replaced with Tailwind CSS divs.
 * Use <div className="flex flex-col"> instead of <VStack>
 * Use <div className="flex flex-row"> instead of <HStack>
 * 
 * This file is kept for backwards compatibility but should not be used in new code.
 * All existing usage has been migrated to Tailwind CSS.
 */

import {ReactNode, CSSProperties} from 'react'

interface StackProps {
    children: ReactNode
    flex?: number
    backgroundColor?: string
    paddingVertical?: number
    paddingHorizontal?: number
    gap?: number
    alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
    justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    height?: string | number
    width?: string | number
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: string | number
    bottom?: string | number
    className?: string
}

/**
 * @deprecated Use <div className="flex flex-col"> with appropriate Tailwind classes instead
 */
export const VStack = (props: StackProps) => {
    console.warn('VStack is deprecated. Use <div className="flex flex-col"> with Tailwind classes instead.')
    return <div className="flex flex-col">{props.children}</div>
}

/**
 * @deprecated Use <div className="flex flex-row"> with appropriate Tailwind classes instead
 */
export const HStack = (props: StackProps) => {
    console.warn('HStack is deprecated. Use <div className="flex flex-row"> with Tailwind classes instead.')
    return <div className="flex flex-row">{props.children}</div>
}
