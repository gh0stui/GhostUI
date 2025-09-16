import {css} from '@emotion/react'
import styled from '@emotion/styled'
import {ReactNode} from 'react'
import {ColorPalette} from "@/constants/ColorPalette";
import {FontSize} from "@/constants/FontSize";

interface ButtonElementProps {
    children: ReactNode
    style: 'fill' | 'inverted'
    color?: string
    onClick: () => void
    fullWidth?: boolean
    disabled?: boolean
}

export const ButtonElement = (props: ButtonElementProps) => {
    const { children, style, color, onClick, disabled, fullWidth } = props

    return <StyledButton
        style={{
            width: fullWidth ? '100%' : 'fit-content',
            backgroundColor: style === 'fill' ? (color ?? ColorPalette.success) : ColorPalette.offwhite,
            border: 'none',
            borderRadius: 10,
            padding: '14px 40px',
            fontSize: FontSize.normal,
            cursor: (disabled ? 'default' : 'pointer'),
            ...props,
            color: style === 'inverted' ? (color ?? ColorPalette.success) : ColorPalette.offwhite,
        }}
        color={color}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </StyledButton>
}

const StyledButton = styled.button`
    ${props => {
    const color = `${props.color ?? ColorPalette.success}10`
    return props.disabled ? '' : css`
            &:hover {
                box-shadow: 200px 0 0 0 ${color} inset,
                            -200px 0 0 0 ${color} inset;
                transition: 1.0s;
            },
        `
}}
`


