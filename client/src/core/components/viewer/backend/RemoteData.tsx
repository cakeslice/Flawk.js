/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CodeBlock from 'core/components/CodeBlock'
import FTable from 'core/components/FTable'
import config from 'core/config'
import { KeyArrayKeyObject } from 'flawk-types'
import { ReduxProps } from 'project-types'
import { memo } from 'react'

const RemoteData = memo(function RemoteData(props: ReduxProps) {
	const { structures } = props

	return (
		<div style={{ maxWidth: 700 }} className='flex-col justify-center'>
			{structures &&
				Object.keys(structures as KeyArrayKeyObject).map((result: string, j) => (
					<div key={result}>
						<tag>{result}</tag>
						<hsp />
						<FTable
							height={'250px'}
							hideHeader
							keySelector={'_id'}
							expandContent={(data) => (
								<CodeBlock
									lang='json'
									data={JSON.stringify({
										...data,
										id: undefined,
										__v: undefined,
									})}
								/>
							)}
							columns={[
								{
									name: 'Name',
									selector: 'name',

									cell: (c) => <div>{c && config.localize(c as string)}</div>,
								},
								{
									name: 'Code',
									selector: 'code',
								},
							]}
							data={structures && structures[result]}
						></FTable>
						<sp />
					</div>
				))}
		</div>
	)
})

export default RemoteData
