import { useEffect, useRef, useState } from 'react'

export function usePrevious<T>(value: T) {
	const ref = useRef(value)
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

export function useFetchLock(
	call: (...args: unknown[]) => Promise<void>
): [boolean, (...args: unknown[]) => Promise<void>] {
	const [fetching, setFetching] = useState(false)

	async function run(...args: unknown[]) {
		setFetching(true)
		await call(...args)
		setFetching(false)
	}

	return [fetching, run]
}
