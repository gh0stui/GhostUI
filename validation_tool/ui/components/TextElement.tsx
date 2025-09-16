import {ReactNode} from 'react'

interface Props {
    children: ReactNode
    className?: string
    color?: string
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
}

export const TextElement = ({ className, children, color, fontSize = 'base' }: Props) => {
    const sizeClass = {
        'sm': 'text-sm',
        'base': 'text-base', 
        'lg': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl'
    }[fontSize]
    
    return <p
        className={`text-center m-0 ${sizeClass} ${className || ''}`}
        style={color ? { color } : undefined}
    >
        {children}
    </p>
}

