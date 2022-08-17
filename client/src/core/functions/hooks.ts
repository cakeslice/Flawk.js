/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react'

export function usePrevious<T>(value: T) {
	const ref = useRef(value)
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

export function useFetchLock<T>(
	call: (args?: T) => Promise<void>
): [boolean, (args?: T) => Promise<void>] {
	const [fetching, setFetching] = useState(false)

	async function run(args?: T) {
		setFetching(true)
		await call(args)
		setFetching(false)
	}

	return [fetching, run]
}

export function useSetState<T>(defaultValue: T): [T, (obj: Partial<T>) => void] {
	const [state, set] = useState<T>(defaultValue)

	const setState = setStateFunction<T>(set)

	return [state, setState]
}
function setStateFunction<T>(setFunction: React.Dispatch<React.SetStateAction<T>>) {
	function set(obj: Partial<T>) {
		setFunction((prev) => {
			return { ...prev, ...obj }
		})
	}
	return set
}
