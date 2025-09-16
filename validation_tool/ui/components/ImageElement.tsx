import {Property} from 'csstype'
import Image, {StaticImageData} from 'next/image'
import React, {CSSProperties} from 'react'

type SafeNumber = number | `${number}`

type Props = {
    src: string | StaticImageData
    alt?: string
    style?: CSSProperties
    onClick?: () => void
    objectFit?: Property.ObjectFit
    objectPosition?: Property.ObjectPosition
    alignSelf?: Property.AlignSelf
    borderRadius?: number
    border?: string
    clickable?: boolean
    onMouseEnter?: () => void
    onMouseLeave?: () => void
} & ({
    height: SafeNumber
    width: SafeNumber
    fill?: boolean
} | {
    height?: never
    width?: never
    fill: boolean
})

export const ImageElement = (props: Props) => {
    const {
        alt,
        src,
        height,
        width,
        style,
        onClick,
        objectFit,
        objectPosition,
        alignSelf,
        borderRadius,
        border,
        clickable,
        fill,
        onMouseLeave,
        onMouseEnter,
    } = props
    return (
        <Image
            alt={alt ?? '이미지 없음'}
            src={src}
            height={height}
            width={width}
            fill={fill}
            style={{
                objectFit,
                objectPosition,
                alignSelf,
                display: 'block',
                borderRadius: borderRadius ?? 0,
                border,
                cursor: clickable ? 'pointer' : 'default',
                ...style,
            }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    )
}


