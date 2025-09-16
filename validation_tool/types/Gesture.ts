export type Gesture =
    'tap' |
    'double_tap' |
    'long_press' |
    'swipe_left' |
    'swipe_right' |
    'scroll_down' |
    'scroll_up' |
    'pinch_zoom_in' |
    'pinch_zoom_out'

export function getGestureFromFullFilePath(filePath: string): Gesture {
    const parts = filePath.split("/").filter(Boolean)
    return parts.length > 2 ? parts[2] as Gesture : 'tap'
}
