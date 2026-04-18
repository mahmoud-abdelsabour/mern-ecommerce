import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
	global.TextDecoder = TextDecoder
}

if (!global.structuredClone) {
	global.structuredClone = (value) => JSON.parse(JSON.stringify(value))
}
