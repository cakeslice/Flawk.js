/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import React from 'react'
import { Beforeunload } from 'react-beforeunload'
import { Prompt } from 'react-router-dom'

export default function ExitPrompt(props: { dirty: boolean; noRouter?: boolean }) {
	return (
		<Beforeunload
			// eslint-disable-next-line
			onBeforeunload={props.dirty ? () => config.text('common.areYouSure') : () => {}}
		>
			{!props.noRouter && (
				<Prompt
					when={props.dirty}
					message={config.text('common.areYouSure') as string}
				></Prompt>
			)}
		</Beforeunload>
	)
}
