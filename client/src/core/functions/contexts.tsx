/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useState, memo } from 'react'

/** This can be used with <Anchor/> and triggerUpdate() to set the current component in view and highlight the link in a nav bar for example */
export const inViewContext = // @ts-ignore
	createContext<[string | undefined, Dispatch<SetStateAction<string | undefined>>]>()
export const InViewProvider = memo(function InViewProvider(props: { children: React.ReactNode }) {
	const [inView, setInView] = useState<string>()

	return (
		<inViewContext.Provider value={[inView, setInView]}>
			{props.children}
		</inViewContext.Provider>
	)
})
