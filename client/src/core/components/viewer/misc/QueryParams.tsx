/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import { useQueryParams } from 'core/components/QueryParams'
import { Section } from 'core/components/viewer/ComponentsViewer'
import 'moment/locale/pt'

export default function QueryParams() {
	const { getQueryParams, setQueryParams } = useQueryParams<{
		bool?: boolean
		number?: number
		string?: string
		date?: Date
		none?: string
		default?: number
	}>({ default: 1 })

	const queryParams = getQueryParams()
	//const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<Section
			code={`import QueryParams from 'core/components/QueryParams'

export default class ComponentWithParams extends QueryParams<{	
	param1?: string
	param2?: number
}> {
	defaultQueryParams = { param2: 5 }

	example = () => {
		this.setQueryParams({
			param1: 'Hello!'
		})

		alert(this.queryParams.param1)
	}
}
`}
			description={
				<>
					<m>Extend</m> your component with <code>QueryParams</code> to <m>set/get</m>{' '}
					query params easily.
					<sp />
					To set query params use <code>this.setQueryParams</code>.
					<br />
					To get query params use <code>this.queryParams</code>.
				</>
			}
			title='Query parameters'
			top
			tags={['extends QueryParams']}
		>
			<div className='wrapMargin flex flex-wrap justify-start'>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								bool: queryParams.bool ? undefined : false,
							},
							true
						)
					}}
				>
					Toggle bool
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								number: queryParams.number ? undefined : 1337,
							},
							true
						)
					}}
				>
					Toggle number
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								string: queryParams.string ? undefined : 'false',
							},
							true
						)
					}}
				>
					Toggle string
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								date: queryParams.date ? undefined : new Date(),
							},
							true
						)
					}}
				>
					Toggle date
				</FButton>
			</div>
			<hsp />
			<div className='wrapMargin flex flex-wrap justify-start'>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								none: queryParams.none ? undefined : '',
							},
							true
						)
					}}
				>
					Toggle empty
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								none: queryParams.none ? undefined : 'undefined',
							},
							true
						)
					}}
				>
					Toggle undefined
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								none: queryParams.none ? undefined : 'null',
							},
							true
						)
					}}
				>
					Toggle null
				</FButton>
				<FButton
					onClick={() => {
						setQueryParams(
							{
								default: queryParams.default !== '1' ? undefined : 2,
							},
							true
						)
					}}
				>
					Toggle default (hidden)
				</FButton>
			</div>
			{Object.keys(queryParams).map((p: string) => {
				const k = p as keyof typeof queryParams
				return (
					<div key={p}>
						<sp />
						<p>
							<tag>{p /* + ' (' + typeof this.queryParams[k] + ')' */}</tag>
							{' ' + queryParams[k]}
						</p>
					</div>
				)
			})}
		</Section>
	)
}
