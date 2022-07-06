/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import CodeBlock from 'core/components/CodeBlock'
import styles from 'core/styles'
import { Obj } from 'flawk-types'
import { useEffect, useState } from 'react'
import Collapsible from '../Collapsible'
import { Next, Section } from './ComponentsViewer'

export default function API() {
	const [api, setApi] = useState<{ paths: Obj }>()

	useEffect(() => {
		async function run() {
			const res = await get('api')
			if (res.ok) setApi(res.body as { paths: Obj })
		}
		run()
	}, [])

	return api && api.paths ? (
		<div>
			<Section title='API' top>
				{Object.keys(api.paths).map((p) => {
					return (
						<Collapsible
							key={p}
							trigger={(isOpen, set) => (
								<b
									style={{
										color: isOpen ? styles.colors.main : undefined,
									}}
								>
									{api &&
										Object.keys(api.paths[p] as Obj)[0].toUpperCase() + ' ' + p}
								</b>
							)}
							content={(set) => (
								<>
									<CodeBlock
										lang='json'
										data={JSON.stringify(api && api.paths[p])}
									/>
									<sp />
								</>
							)}
						></Collapsible>
					)
				})}
			</Section>

			<Next backName='Backend' backLink='backend/features' />
		</div>
	) : (
		<div />
	)
}
