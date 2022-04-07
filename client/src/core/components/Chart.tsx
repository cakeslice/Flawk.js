/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import faker from '@faker-js/faker'
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	ChartData,
	ChartType,
	CoreChartOptions,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PluginChartOptions,
	PointElement,
	ScaleChartOptions,
	ScriptableContext,
	Title,
	Tooltip,
} from 'chart.js'
import {
	TreemapController,
	TreemapControllerDatasetOptions,
	TreemapDataPoint,
	TreemapElement,
} from 'chartjs-chart-treemap'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import Loading from 'core/components/Loading'
import config from 'core/config'
import styles from 'core/styles'
import React from 'react'
import { Bar, Chart, Doughnut, Line, Pie } from 'react-chartjs-2'
import TrackedComponent from './TrackedComponent'

export type TreemapData = {
	datasets: TreemapControllerDatasetOptions<Record<string, unknown>>[]
}
export const getTreemapColor = (
	ctx: ScriptableContext<'treemap'> & TreemapDataPoint,
	colors: string[]
): string => {
	// @ts-ignore
	if (ctx.type === 'data') {
		// @ts-ignore
		return colors[ctx.raw._data._idx]
	} else return 'transparent'
}

ChartJS.register(
	ChartDataLabels,
	CategoryScale,
	ArcElement,
	LinearScale,
	Filler,
	BarElement,
	Title,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	TreemapController,
	TreemapElement
)

type Options<T extends ChartType> = Partial<CoreChartOptions<T>> &
	Partial<ScaleChartOptions<T>> &
	Partial<PluginChartOptions<T>>

const getPercent = (value: number, datapoints: number[]) => {
	const total = datapoints.reduce((total: number, datapoint: number) => total + datapoint, 0)
	const percentage = (value / total) * 100
	return percentage.toFixed(2) + '%'
}

//

export const mockColors = [styles.colors.main, '#5841D8', '#FF8B8B', '#FEB58D']
const mockBarLabels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
export const mockBar: ChartData<'bar', number[], unknown> = {
	labels: mockBarLabels,
	datasets: [
		{
			label: 'Dataset 1',
			data: mockBarLabels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
			backgroundColor: mockColors[0],
		},
	],
}
export const mockLine: ChartData<'line', number[], unknown> = {
	labels: mockBarLabels,
	datasets: [
		{
			label: 'Active Users',
			data: mockBarLabels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
			backgroundColor: mockColors[0],
		},
		{
			label: 'New Users',
			borderColor: config.replaceAlpha(mockColors[3], 0.5),
			data: mockBarLabels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
			backgroundColor: mockColors[3],
		},
	],
}
const mockDoughnutLabels = ['Tech', 'Finance', 'Marketing', 'Sales']
export const mockDoughnut: ChartData<'doughnut', number[], unknown> = {
	labels: mockDoughnutLabels,
	datasets: [
		{
			label: 'Dataset 1',
			data: mockDoughnutLabels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
			backgroundColor: mockColors,
			borderColor: global.nightMode
				? config.replaceAlpha(styles.colors.white, 0.25)
				: styles.colors.white,
			borderWidth: 1,
		},
	],
}
const mockPieLabels = ['React', 'Node', 'MongoDB', 'Express']
export const mockPie: ChartData<'pie', number[], unknown> = {
	labels: mockPieLabels,
	datasets: [
		{
			label: 'Dataset 1',
			data: mockPieLabels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
			backgroundColor: mockColors,
			borderColor: global.nightMode
				? config.replaceAlpha(styles.colors.white, 0.25)
				: styles.colors.white,
			borderWidth: 1,
		},
	],
}

//

const tooltipPadding = 8
const tooltipStyle = {
	displayColors: false,
	caretSize: 0,
	cornerRadius: 0,
	backgroundColor: global.nightMode ? styles.colors.background : styles.colors.white,
	footerMarginTop: 0,
	titleColor: styles.colors.black,
	bodyColor: styles.colors.black,
	titleFont: { weight: 'normal', size: 13 },
	bodyFont: { weight: 'normal', size: 13 },
	padding: {
		left: tooltipPadding,
		right: tooltipPadding,
		top: tooltipPadding,
		bottom: tooltipPadding - 2,
	},
	borderWidth: 1,
	borderColor: 'rgba(127,127,127,.25)',
}
const loadingStyle = {
	width: '100%',
	height: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
}
type CoreProps = {
	dataLabels?: boolean
	isLoading?: boolean
	style?: React.CSSProperties
	className?: string
	percentTooltip?: boolean
	children?: React.ReactNode
}

//

type BarProps = {
	percent?: boolean
	stacked?: boolean
	horizontal?: boolean
	barThickness?: number
	rotateLabels?: boolean
	labelAxis: 'xy' | 'x' | 'y' | 'none'
	data?: ChartData<'bar', number[]>
	options?: Options<'bar'>
} & CoreProps
export class BarChart extends TrackedComponent<BarProps> {
	trackedName = 'BarChart'
	shouldComponentUpdate(nextProps: BarProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {}

	options = (): Options<'bar'> => {
		return {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					top: 30,
				},
			},
			indexAxis: this.props.horizontal ? 'y' : 'x',
			datasets: {
				// @ts-ignore
				bar: {
					maxBarThickness:
						this.props.barThickness !== undefined ? this.props.barThickness : 40,
				},
			},
			scales: {
				x: {
					stacked: this.props.horizontal && this.props.stacked ? true : false,
					display: this.props.labelAxis?.includes('x') || false,
					// @ts-ignore
					grid: {
						display: false,
						color: config.replaceAlpha(styles.colors.black, 0.1),
						borderColor: 'transparent', //config.replaceAlpha(styles.colors.black, 0.5),
					},
					ticks: {
						padding: 10,
						color: styles.colors.black,
						// @ts-ignore
						font: {
							size: 13,
						},
						...(this.props.rotateLabels && { maxRotation: 45, minRotation: 45 }),
					},
				},
				y: {
					stacked: this.props.stacked ? true : false,
					display: this.props.labelAxis?.includes('y') || false,
					// @ts-ignore
					grid: {
						display: false,
						color: config.replaceAlpha(styles.colors.black, 0.1),
						borderColor: 'transparent', //config.replaceAlpha(styles.colors.black, 0.5),
					},
					ticks: {
						// @ts-ignore
						beginAtZero: true,
						color: styles.colors.black,
						// @ts-ignore
						font: {
							size: 13,
						},
					},
				},
			},
			plugins: {
				tooltip: {
					...tooltipStyle,
					titleMarginBottom: 0,
					callbacks: {
						// @ts-ignore
						yPadding: 3,
						title: (context) => {
							let label = context[0].label || ''
							if (label) {
								label += ': '
							}
							label += this.props.percentTooltip
								? getPercent(
										this.props.horizontal
											? context[0].parsed.x
											: context[0].parsed.y,
										context[0].chart.data.datasets[0].data as number[]
								  )
								: config.formatNumber(
										this.props.horizontal
											? context[0].parsed.x
											: context[0].parsed.y
								  )
							return label
						},
						label: (context) => {
							let label = context.dataset.label || ''
							if (label) {
								label += ': '
							}
							label += this.props.horizontal ? context.parsed.x : context.parsed.y
							return '' //label
						},
					},
				},
				datalabels: {
					formatter: (value: number, ctx) => {
						return this.props.percent
							? getPercent(value, ctx.chart.data.datasets[0].data as number[])
							: config.formatNumber(value)
					},
					display: this.props.dataLabels !== undefined ? this.props.dataLabels : true,
					color: styles.colors.black,
					anchor: 'end',
					offset: -30,
					align: 'start',
					font: {
						size: 13,
					},
				},
				legend: {
					display: false,
					// @ts-ignore
					labels: {
						color: styles.colors.black,
					},
					position: 'top' as const,
				},
				// @ts-ignore
				title: {
					display: false,
				},
			},
			...this.props.options,
		}
	}

	render() {
		if (this.props.isLoading)
			<div style={loadingStyle}>
				<Loading />
			</div>

		return (
			<Bar
				options={this.options()}
				data={
					this.props.data || {
						labels: [],
						datasets: [],
					}
				}
			/>
		)
	}
}

type LineProps = {
	percent?: boolean
	stacked?: boolean
	dotRadius?: number
	rotateLabels?: boolean
	labelAxis: 'xy' | 'x' | 'y' | 'none'
	data?: ChartData<'line', number[]>
	options?: Options<'line'>
} & CoreProps
export class LineChart extends TrackedComponent<LineProps> {
	trackedName = 'LineChart'
	shouldComponentUpdate(nextProps: LineProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {}

	options = (): Options<'line'> => {
		const multipleDatasets = (this.props.data?.datasets?.length || 0) > 1

		return {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					top: 30,
				},
			},
			datasets: {
				// @ts-ignore
				line: {
					borderColor: config.replaceAlpha(styles.colors.main, 0.5),
				},
			},
			elements: {
				point: {
					radius: this.props.dotRadius !== undefined ? this.props.dotRadius : 3,
				},
			},
			...(multipleDatasets && {
				interaction: {
					mode: 'nearest',
					axis: 'x',
					intersect: false,
				},
			}),
			scales: {
				x: {
					display: this.props.labelAxis?.includes('x') || false,
					// @ts-ignore
					grid: {
						display: false,
						color: config.replaceAlpha(styles.colors.black, 0.1),
						borderColor: 'transparent', //config.replaceAlpha(styles.colors.black, 0.5),
					},
					ticks: {
						padding: 10,
						color: styles.colors.black,
						// @ts-ignore
						font: {
							size: 13,
						},
						...(this.props.rotateLabels && { maxRotation: 45, minRotation: 45 }),
					},
				},
				y: {
					stacked: this.props.stacked,
					display: this.props.labelAxis?.includes('y') || false,
					// @ts-ignore
					grid: {
						display: false,
						color: config.replaceAlpha(styles.colors.black, 0.1),
						borderColor: 'transparent', //config.replaceAlpha(styles.colors.black, 0.5),
					},
					ticks: {
						// @ts-ignore
						beginAtZero: true,
						color: styles.colors.black,
						// @ts-ignore
						font: {
							size: 13,
						},
					},
				},
			},
			plugins: {
				tooltip: {
					...tooltipStyle,
					...(multipleDatasets
						? {
								displayColors: true,
								titleFont: { weight: 'bold' },
								titleAlign: 'center',
								bodyAlign: 'left',
						  }
						: {
								titleMarginBottom: 0,
						  }),
					callbacks: {
						// @ts-ignore
						yPadding: 3,
						title: (context) => {
							let label = context[0].label || ''

							if (multipleDatasets) return label

							if (label) {
								label += ': '
							}

							label += this.props.percentTooltip
								? getPercent(
										context[0].parsed.y,
										context[0].chart.data.datasets[0].data as number[]
								  )
								: config.formatNumber(context[0].parsed.y)
							return label
						},
						label: (context) => {
							let label = context.dataset.label || ''
							if (label) {
								label += ': '
							}
							label += config.formatNumber(context.parsed.y)
							return multipleDatasets ? ' ' + label : ''
						},
					},
				},
				datalabels: {
					formatter: (value: number, ctx) => {
						return this.props.percent
							? getPercent(value, ctx.chart.data.datasets[0].data as number[])
							: config.formatNumber(value)
					},
					display: this.props.dataLabels !== undefined ? this.props.dataLabels : true,
					color: styles.colors.black,
					anchor: 'end',
					offset: -30,
					align: 'start',
					font: {
						size: 13,
					},
				},
				legend: {
					display: false,
					// @ts-ignore
					labels: {
						color: styles.colors.black,
					},
					position: 'top' as const,
				},
				// @ts-ignore
				title: {
					display: false,
				},
			},
			...this.props.options,
		}
	}

	render() {
		if (this.props.isLoading)
			<div style={loadingStyle}>
				<Loading />
			</div>

		return (
			<Line
				options={this.options()}
				data={
					this.props.data || {
						labels: [],
						datasets: [],
					}
				}
			/>
		)
	}
}

type DoughnutProps = {
	data?: ChartData<'doughnut', number[]>
	options?: Options<'doughnut'>
} & CoreProps
export class DoughnutChart extends TrackedComponent<DoughnutProps> {
	trackedName = 'DoughnutChart'
	shouldComponentUpdate(nextProps: DoughnutProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {}

	options = (): Options<'doughnut'> => {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				// @ts-ignore
				tooltip: {
					...tooltipStyle,
					// @ts-ignore
					callbacks: {
						label: (context) => {
							let label = context.label || ''
							if (label) {
								label += ': '
							}
							label += this.props.percentTooltip
								? getPercent(context.parsed, context.dataset.data)
								: config.formatNumber(context.parsed)
							return label
						},
					},
				},
				datalabels: {
					display: this.props.dataLabels !== undefined ? this.props.dataLabels : false,
				},
				legend: {
					display: false,
					// @ts-ignore
					labels: {
						color: styles.colors.black,
					},
					position: 'top' as const,
				},
				// @ts-ignore
				title: {
					display: false,
				},
			},
			...this.props.options,
		}
	}

	render() {
		if (this.props.isLoading)
			<div style={loadingStyle}>
				<Loading />
			</div>

		return (
			<Doughnut
				options={this.options()}
				data={
					this.props.data || {
						labels: [],
						datasets: [],
					}
				}
			/>
		)
	}
}

type PieProps = {
	data?: ChartData<'pie', number[]>
	options?: Options<'pie'>
} & CoreProps
export class PieChart extends TrackedComponent<PieProps> {
	trackedName = 'PieChart'
	shouldComponentUpdate(nextProps: PieProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {}

	options = (): Options<'pie'> => {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				// @ts-ignore
				tooltip: {
					...tooltipStyle,
					// @ts-ignore
					callbacks: {
						label: (context) => {
							let label = context.label || ''
							if (label) {
								label += ': '
							}
							label += this.props.percentTooltip
								? getPercent(context.parsed, context.dataset.data)
								: config.formatNumber(context.parsed)
							return label
						},
					},
				},
				datalabels: {
					display: this.props.dataLabels !== undefined ? this.props.dataLabels : false,
				},
				legend: {
					display: false,
					// @ts-ignore
					labels: {
						color: styles.colors.black,
					},
					position: 'top' as const,
				},
				// @ts-ignore
				title: {
					display: false,
				},
			},
			...this.props.options,
		}
	}

	render() {
		if (this.props.isLoading)
			<div style={loadingStyle}>
				<Loading />
			</div>

		return (
			<Pie
				options={this.options()}
				data={
					this.props.data || {
						labels: [],
						datasets: [],
					}
				}
			/>
		)
	}
}

type TreemapProps = {
	data?: TreemapData
	options?: Options<'treemap'>
} & CoreProps
export class TreemapChart extends TrackedComponent<TreemapProps> {
	trackedName = 'TreemapChart'
	shouldComponentUpdate(nextProps: TreemapProps, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {}

	options = (): Options<'treemap'> => {
		return {
			responsive: true,
			maintainAspectRatio: false,
			datasets: {
				// @ts-ignore
				treemap: {
					labels: {
						display: true,
						color: styles.colors.whiteDay,
						formatter: (ctx) => {
							const context = ctx.chart.data

							// @ts-ignore
							const width = context.datasets[ctx.datasetIndex].data[ctx.dataIndex].w
							if (width < 100) return ''

							// @ts-ignore
							const value = context.datasets[ctx.datasetIndex].tree[ctx.dataIndex]
								.count as number
							let label = // @ts-ignore
								context.datasets[ctx.datasetIndex].tree[ctx.dataIndex].label || ''
							if (label) {
								label += ': '
							}
							label += this.props.percentTooltip
								? getPercent(
										value,
										// @ts-ignore
										// eslint-disable-next-line
										context.datasets[ctx.datasetIndex].tree.map((d) => d.count)
								  )
								: config.formatNumber(value)
							return label
						},
					},
				},
			},
			plugins: {
				// @ts-ignore
				tooltip: {
					...tooltipStyle,
					titleMarginBottom: 0,
					callbacks: {
						// @ts-ignore
						yPadding: 3,
						title: (ctx) => '',
						label: (ctx) => {
							const context = ctx.chart.data

							// @ts-ignore
							const value = context.datasets[ctx.datasetIndex].tree[ctx.dataIndex]
								.count as number
							let label = // @ts-ignore
								context.datasets[ctx.datasetIndex].tree[ctx.dataIndex].label || ''
							if (label) {
								label += ': '
							}

							label += config.formatNumber(value)
							return label
						},
					},
				},
				datalabels: {
					display: this.props.dataLabels !== undefined ? this.props.dataLabels : false,
				},
				legend: {
					display: false,
					// @ts-ignore
					labels: {
						color: styles.colors.black,
					},
					position: 'top' as const,
				},
				// @ts-ignore
				title: {
					display: false,
				},
			},
			...this.props.options,
		}
	}

	render() {
		if (this.props.isLoading)
			<div style={loadingStyle}>
				<Loading />
			</div>

		return (
			<Chart
				type='treemap'
				options={this.options()}
				data={
					this.props.data || {
						labels: [],
						datasets: [],
					}
				}
			/>
		)
	}
}
