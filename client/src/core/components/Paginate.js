/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import styles from 'core/styles'
import PropTypes from 'prop-types'
import React from 'react'
import { getPaginationModel } from 'ultimate-pagination'

const pageArrow = (color) => (
	<svg width='7' height='11' viewBox='0 0 7 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M5.00003 11C5.19778 10.9999 5.39108 10.9413 5.55549 10.8314C5.7199 10.7215 5.84804 10.5653 5.92371 10.3826C5.99938 10.1999 6.01918 9.99891 5.98061 9.80496C5.94205 9.61101 5.84684 9.43284 5.70703 9.29299L2.41403 5.99999L5.70703 2.70699C5.80254 2.61474 5.87872 2.5044 5.93113 2.38239C5.98354 2.26039 6.01113 2.12917 6.01228 1.99639C6.01344 1.86361 5.98813 1.73193 5.93785 1.60904C5.88757 1.48614 5.81332 1.37449 5.71943 1.28059C5.62553 1.1867 5.51388 1.11245 5.39098 1.06217C5.26809 1.01189 5.13641 0.986585 5.00363 0.987739C4.87085 0.988893 4.73963 1.01648 4.61763 1.06889C4.49562 1.1213 4.38528 1.19748 4.29303 1.29299L0.293031 5.29299C0.105559 5.48052 0.000244141 5.73483 0.000244141 5.99999C0.000244141 6.26515 0.105559 6.51946 0.293031 6.70699L4.29303 10.707C4.48052 10.8945 4.73484 10.9999 5.00003 11Z'
			fill={color}
		/>
	</svg>
)
class Paginate extends React.Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
	}
	static defaultProps = {}

	createPagination() {
		const { boundaryPagesRange, siblingPagesRange, breakDelimiter, onClick, link } = this.props

		var totalPages = this.props.totalPages && Number(this.props.totalPages)
		var currentPage = this.props.currentPage && Number(this.props.currentPage)
		if (currentPage > totalPages) currentPage = totalPages

		const paginationModel = getPaginationModel({
			currentPage,
			totalPages,
			boundaryPagesRange,
			siblingPagesRange,
			hideEllipsis: false,
			hidePreviousAndNextPageLinks: true,
			hideFirstAndLastPageLinks: true,
		})

		return paginationModel.map((data, key) => {
			if (data.type === 'PAGE') {
				return (
					<li
						style={{
							opacity: data.isActive ? 0.75 : 0.5,
							color: styles.colors.black,
							...this.props.style,
						}}
						onClick={() => onClick(data.value)}
						className={`PaginateXPage ${
							data.isActive ? 'PaginateXCurrent' : 'PaginateXLink'
						}`}
						key={`PaginateX${data.key}`}
					>
						{link(data.value, data.value)}
					</li>
				)
			}
			return (
				<li
					style={{ opacity: 0.75, color: styles.colors.black, ...this.props.style }}
					className='PaginateXBreak'
					key={`PaginateX${data.key}`}
				>
					{breakDelimiter}
				</li>
			)
		})
	}
	render() {
		const { previous, next, first, last, onClick, link, hideInactive } = this.props

		var totalPages = this.props.totalPages && Number(this.props.totalPages)
		var currentPage = this.props.currentPage && Number(this.props.currentPage)
		if (currentPage > totalPages) currentPage = totalPages

		const isFirst = currentPage === 1
		const isLast = currentPage === totalPages

		if (totalPages === undefined || currentPage === undefined || totalPages === 0)
			return <div style={{ minHeight: 44 }}></div>

		return (
			<div
				className='flex justify-center items-center'
				style={{
					alignSelf: 'stretch',
					...this.props.style,
				}}
			>
				<ul className='PaginateX'>
					{first && (!hideInactive || !isFirst) && (
						<li
							className={`PaginateXFirst ${isFirst ? '' : 'PaginateXLink'}`}
							onClick={() => {
								if (!isFirst) {
									onClick(1)
								}
							}}
						>
							{link(1, first)}
						</li>
					)}
					{previous && (!hideInactive || !isFirst) && (
						<li
							className={`PaginateXPrev ${isFirst ? '' : 'PaginateXLink'}`}
							onClick={() => {
								if (!isFirst) {
									onClick(currentPage - 1)
								}
							}}
						>
							{/* link(currentPage - 1, previous) */}
							<div
								style={{
									opacity: !isFirst ? 0.5 : 0.25,
									...this.props.style,
								}}
							>
								{pageArrow(styles.colors.black)}
							</div>
						</li>
					)}
					{this.createPagination()}
					{next && (!hideInactive || !isLast) && (
						<li
							className={`PaginateXNext ${isLast ? '' : 'PaginateXLink'}`}
							onClick={() => {
								if (!isLast) {
									onClick(currentPage + 1)
								}
							}}
						>
							{/* link(currentPage + 1, next) */}
							<div
								style={{
									transform: 'scaleX(-1)',
									opacity: !isLast ? 0.5 : 0.25,
									...this.props.style,
								}}
							>
								{pageArrow(styles.colors.black)}
							</div>
						</li>
					)}
					{last && (!hideInactive || !isLast) && (
						<li
							className={`PaginateXLast ${isLast ? '' : 'PaginateXLink'}`}
							onClick={() => {
								if (!isLast) {
									onClick(totalPages)
								}
							}}
						>
							{link(totalPages, last)}
						</li>
					)}
					<style
						dangerouslySetInnerHTML={{
							__html: `
					.PaginateX{
						list-style-type: none;
						margin: 0;
						padding: 0;
						user-select: none;
					}
					.PaginateX li{
						display: inline-block;
						padding: 12px;
					}
					.PaginateXLink{
						cursor: pointer;
						font-size: ${14}px;
					}
					.PaginateXCurrent{
						color: ${styles.colors.main};
						font-size: ${14}px;
					}
				`,
						}}
					/>
				</ul>
			</div>
		)
	}
}

Paginate.defaultProps = {
	previous: 'previous',
	next: 'next',
	first: false,
	last: false,
	breakDelimiter: '...',
	currentPage: 1,
	boundaryPagesRange: 2,
	siblingPagesRange: 2,
	hideInactive: false,
	hideEllipsis: false,
	link: (n, t) => t,
}

export default Paginate
