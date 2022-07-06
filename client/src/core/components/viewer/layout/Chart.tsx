/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChartData } from 'chart.js'
import {
	BarChart,
	DoughnutChart,
	LineChart,
	mockBar,
	mockColors,
	mockDoughnut,
	mockLine,
	mockPie,
	PieChart,
} from 'core/components/Chart'
import { Section } from 'core/components/viewer/ComponentsViewer'
import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'

export default function Chart() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<Section
			description={
				<>
					The the following <m>chart types</m> are available:
					<ul>
						<li>
							<code>{'BarChart'}</code>
						</li>
						<li>
							<code>{'LineChart'}</code>
						</li>
						<li>
							<code>{'DoughnutChart'}</code>
						</li>
						<li>
							<code>{'PieChart'}</code>
						</li>
						<li>
							<code>{'TreemapChart'}</code>
						</li>
					</ul>
					<sp />
					Use <code>data</code> prop to supply the chart with the <m>datasets</m>,{' '}
					<m>labels</m> and <m>options</m>.
					<sp />
					This component uses <code>react-chartjs-2</code> internally.
				</>
			}
			code={`import {
	DoughnutChart,
} from 'core/components/Chart'
			
const colors = ['#28c986', '#5841D8', '#FF8B8B', '#FEB58D']
const labels = ['Tech', 'Finance', 'Marketing', 'Sales']
const data = [33, 40, 12, 15]

<DoughnutChart
	data={{
		labels: labels,
		datasets: [
			{
				label: 'Dataset 1',
				data: data,
				backgroundColor: colors,
			},
		],
	}}
></DoughnutChart>
`}
			title='Chart'
			tags={['Chart.tsx', 'chart.js']}
		>
			<div
				className={desktop ? 'grid grid-cols-2' : 'wrapMarginBigVertical flex-col'}
				style={{ gap: 25 }}
			>
				<StatCard title='Doughnut Chart' footer={<ChartLabels data={mockDoughnut} />}>
					<DoughnutChart percentTooltip data={mockDoughnut}></DoughnutChart>
				</StatCard>
				<StatCard title={'Pie Chart'} footer={<ChartLabels data={mockPie} />}>
					<PieChart data={mockPie}></PieChart>
				</StatCard>
				{desktop && (
					<StatCard style={{ marginBottom: 10, height: 400 }} title={'Bar Chart'}>
						<BarChart
							labelAxis='x'
							dataLabels={desktop}
							percent
							data={mockBar}
						></BarChart>
					</StatCard>
				)}
				{desktop && (
					<StatCard style={{ marginBottom: 10, height: 400 }} title={'Line Chart'}>
						<LineChart
							labelAxis='x'
							dataLabels={false}
							percent
							data={mockLine}
						></LineChart>
					</StatCard>
				)}
			</div>
		</Section>
	)
}

function ChartLabels(props: { data?: ChartData<'doughnut' | 'pie', number[]> }) {
	return (
		<div className='wrapMarginBig flex flex-wrap items-center justify-center'>
			{props.data?.labels?.map((l, i) => (
				<div className='flex items-center' key={l as string}>
					<div
						style={{
							borderRadius: '50%',
							width: 7.5,
							height: 7.5,
							background: mockColors[i],
							marginRight: 7.5,
						}}
					/>
					<div>{l as string}</div>
				</div>
			))}
		</div>
	)
}

function StatCard(props: {
	children: React.ReactNode
	title: string | React.ReactNode
	footer?: React.ReactNode
	full?: boolean
	span?: number
	style?: React.CSSProperties
}) {
	const p = 15

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div
			className={props.span ? 'col-span-' + props.span : props.full ? 'col-span-full' : ''}
			style={{
				...styles.card,
				margin: 0,
				padding: 0,
				background: styles.colors.white,
				flexGrow: 1,
				width: '100%',
			}}
		>
			<div style={{ padding: p, paddingBottom: p, fontWeight: 500 }}>
				{typeof props.title === 'string' ? <p>{props.title}</p> : props.title}
			</div>
			<hr style={{ margin: 0 }} />
			<div style={{ padding: p, height: 200, ...props.style }}>{props.children}</div>
			{props.footer && <hr style={{ margin: 0 }} />}
			{props.footer && (
				<div
					className='flex justify-center items-center'
					style={{ padding: p, paddingTop: p }}
				>
					{props.footer}
				</div>
			)}
		</div>
	)
}
