/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import styles from 'core/styles'
import React from 'react'
import { SizeMe } from 'react-sizeme'
import { getPaginationModel } from 'ultimate-pagination'

const buttonStyle = {
	padding: 12,
	fontSize: styles.defaultFontSize,
}

type Props = {
	onClick: (totalPages: number) => void
	currentPage: number
	totalPages: number
	breakDelimiter?: string
	boundaryPagesRange?: number
	siblingPagesRange?: number
	hideInactive?: boolean
	hideEllipsis?: boolean
	style?: React.CSSProperties
}
export default function Paginate(props: Props) {
	const {
		onClick,
		currentPage,
		breakDelimiter,
		boundaryPagesRange,
		siblingPagesRange,
		hideInactive,
		hideEllipsis,
		style,
	} = {
		// @ts-ignore
		currentPage: 1,
		breakDelimiter: '...',
		boundaryPagesRange: 1,
		siblingPagesRange: 1,
		hideInactive: false,
		hideEllipsis: false,
		...props,
	} as Props & { mini: boolean }

	function createPagination(bPR?: number, sPR?: number, noDelimiter?: boolean) {
		const totalPages = props.totalPages
		let cP = Number(currentPage)
		if (cP > totalPages) cP = totalPages

		const paginationModel = getPaginationModel({
			currentPage: cP,
			totalPages,
			boundaryPagesRange: bPR,
			siblingPagesRange: sPR,
			hideEllipsis,
			hidePreviousAndNextPageLinks: true,
			hideFirstAndLastPageLinks: true,
		})

		return (
			noDelimiter ? paginationModel.filter((p) => p.type === 'PAGE') : paginationModel
		).map((data, key) => {
			if (data.type === 'PAGE') {
				return (
					<button
						disabled={data.isActive}
						style={{
							color: data.isActive ? styles.colors.main : styles.colors.black,
							opacity: data.isActive ? 1 : global.nightMode ? 0.5 : 0.75,
							fontWeight: data.isActive ? 'bold' : 'normal',
							...buttonStyle,
							...style,
						}}
						onClick={() => onClick(data.value)}
						key={`Paginate${data.key}`}
					>
						{data.value}
					</button>
				)
			}
			return (
				<div
					style={{
						alignSelf: 'center',
						opacity: global.nightMode ? 0.25 : 0.5,
						color: styles.colors.black,
						...style,
					}}
					key={`Paginate${data.key}`}
				>
					{breakDelimiter}
				</div>
			)
		})
	}

	const totalPages = props.totalPages
	let cP = Number(props.currentPage)
	if (cP > totalPages) cP = totalPages

	const isFirst = cP === 1
	const isLast = cP === totalPages

	if (totalPages === undefined || cP === undefined || totalPages === 0)
		return <div style={{ minHeight: 44 }}></div>

	return (
		<SizeMe>
			{({ size }) => {
				const mini = size && size.width && size.width < 300 ? true : false

				const bPR = mini ? 0 : boundaryPagesRange
				const sPR = mini ? 1 : siblingPagesRange

				return (
					<div
						className='flex grow justify-center items-center'
						style={{
							alignSelf: 'stretch',
							...style,
						}}
					>
						<div className='flex flex-wrap'>
							{(!hideInactive || !isFirst) && (
								<button
									disabled={isFirst}
									style={{ ...buttonStyle }}
									onClick={() => {
										if (!isFirst) {
											onClick(mini ? 1 : cP - 1)
										}
									}}
								>
									<div
										style={{
											opacity: !isFirst ? 0.5 : 0.15,
											...style,
										}}
									>
										{mini
											? pageDoubleArrow(styles.colors.black)
											: pageArrow(styles.colors.black)}
									</div>
								</button>
							)}
							{createPagination(bPR, sPR, mini)}
							{(!hideInactive || !isLast) && (
								<button
									disabled={isLast}
									style={{ ...buttonStyle }}
									onClick={() => {
										if (!isLast) {
											onClick(mini ? totalPages : cP + 1)
										}
									}}
								>
									<div
										style={{
											transform: 'scaleX(-1)',
											opacity: !isLast ? 0.5 : 0.15,
											...style,
										}}
									>
										{mini
											? pageDoubleArrow(styles.colors.black)
											: pageArrow(styles.colors.black)}
									</div>
								</button>
							)}
						</div>
					</div>
				)
			}}
		</SizeMe>
	)
}

const pageArrow = (color: string) => (
	<svg width='7' height='11' viewBox='0 0 7 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M5.00003 11C5.19778 10.9999 5.39108 10.9413 5.55549 10.8314C5.7199 10.7215 5.84804 10.5653 5.92371 10.3826C5.99938 10.1999 6.01918 9.99891 5.98061 9.80496C5.94205 9.61101 5.84684 9.43284 5.70703 9.29299L2.41403 5.99999L5.70703 2.70699C5.80254 2.61474 5.87872 2.5044 5.93113 2.38239C5.98354 2.26039 6.01113 2.12917 6.01228 1.99639C6.01344 1.86361 5.98813 1.73193 5.93785 1.60904C5.88757 1.48614 5.81332 1.37449 5.71943 1.28059C5.62553 1.1867 5.51388 1.11245 5.39098 1.06217C5.26809 1.01189 5.13641 0.986585 5.00363 0.987739C4.87085 0.988893 4.73963 1.01648 4.61763 1.06889C4.49562 1.1213 4.38528 1.19748 4.29303 1.29299L0.293031 5.29299C0.105559 5.48052 0.000244141 5.73483 0.000244141 5.99999C0.000244141 6.26515 0.105559 6.51946 0.293031 6.70699L4.29303 10.707C4.48052 10.8945 4.73484 10.9999 5.00003 11Z'
			fill={color}
		/>
	</svg>
)
const pageDoubleArrow = (color: string) => (
	<svg width='10' height='11' viewBox='0 0 10 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<g clipPath='url(#clip0_1428_6)'>
			<path
				d='M5.00003 11C5.19778 10.9999 5.39108 10.9413 5.55549 10.8314C5.7199 10.7215 5.84804 10.5653 5.92371 10.3826C5.99938 10.1999 6.01918 9.99888 5.98061 9.80493C5.94205 9.61098 5.84684 9.43281 5.70703 9.29296L2.41403 5.99996L5.70703 2.70696C5.80254 2.61471 5.87872 2.50437 5.93113 2.38236C5.98354 2.26036 6.01113 2.12914 6.01228 1.99636C6.01344 1.86358 5.98813 1.7319 5.93785 1.60901C5.88757 1.48611 5.81332 1.37446 5.71943 1.28056C5.62553 1.18667 5.51388 1.11242 5.39098 1.06214C5.26809 1.01186 5.13641 0.986555 5.00363 0.987709C4.87085 0.988863 4.73963 1.01645 4.61763 1.06886C4.49562 1.12127 4.38528 1.19745 4.29303 1.29296L0.293031 5.29296C0.105559 5.48049 0.000244141 5.7348 0.000244141 5.99996C0.000244141 6.26512 0.105559 6.51943 0.293031 6.70696L4.29303 10.707C4.48052 10.8945 4.73484 10.9999 5.00003 11Z'
				fill={color}
			/>
			<path
				d='M8.99979 11C9.19754 10.9999 9.39084 10.9413 9.55525 10.8314C9.71966 10.7215 9.8478 10.5653 9.92347 10.3826C9.99914 10.1999 10.0189 9.99888 9.98037 9.80493C9.94181 9.61098 9.8466 9.43281 9.70679 9.29296L6.41379 5.99996L9.70679 2.70696C9.8023 2.61471 9.87848 2.50437 9.93089 2.38236C9.9833 2.26036 10.0109 2.12914 10.012 1.99636C10.0132 1.86358 9.98789 1.7319 9.93761 1.60901C9.88733 1.48611 9.81308 1.37446 9.71919 1.28056C9.62529 1.18667 9.51364 1.11242 9.39074 1.06214C9.26785 1.01186 9.13617 0.986555 9.00339 0.987709C8.87061 0.988863 8.73939 1.01645 8.61739 1.06886C8.49538 1.12127 8.38504 1.19745 8.29279 1.29296L4.29279 5.29296C4.10531 5.48049 4 5.7348 4 5.99996C4 6.26512 4.10531 6.51943 4.29279 6.70696L8.29279 10.707C8.48028 10.8945 8.7346 10.9999 8.99979 11Z'
				fill={color}
			/>
		</g>
		<defs>
			<clipPath id='clip0_1428_6'>
				<rect width='10' height='11' fill='white' />
			</clipPath>
		</defs>
	</svg>
)
