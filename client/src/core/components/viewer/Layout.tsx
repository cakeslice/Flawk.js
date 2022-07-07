/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'
import { Next, Section } from './ComponentsViewer'

// Can't use React.lazy() for anchor links to work

import Chart from 'core/components/viewer/layout/Chart'
import Collapse from 'core/components/viewer/layout/Collapse'
import Modal from 'core/components/viewer/layout/Modal'
import Pagination from 'core/components/viewer/layout/Pagination'
import Sticky from 'core/components/viewer/layout/Sticky'
import Table from 'core/components/viewer/layout/Table'
import Toast from 'core/components/viewer/layout/Toast'

type Props = { horizontalDashboard: boolean; toggleDashboardLayout: () => void }
export default function Layout(props: Props) {
	const fixedExample = {
		width: 200,
		height: 50,
		opacity: 0.1,
		backgroundColor: styles.colors.black,
	}
	const growExample = {
		flexGrow: 1,
		...fixedExample,
	}
	const gridExample = {
		height: 50,
		opacity: 0.1,
		backgroundColor: styles.colors.black,
	}

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div>
			{desktop && (
				<Section
					description={
						<>
							The <code>{'<Dashboard/>'}</code> component provides a simple way to add{' '}
							<m>pages</m> (routes) and <m>navigation</m> to your app.
							<sp />
							Use <code>path</code> prop to set the <m>parent path</m> of all pages.
							<br />
							Use <code>routes</code> prop to define each page path and their
							respective components, titles and icons.
							<br />
							Use <code>wrapperComponent</code> prop to set the{' '}
							<m>parent component</m> of all pages.
							<sp />
							On <m>desktop</m>, navigation controls are on a vertical bar on the left
							by default but can be changed to a horizontal top bar using the{' '}
							<code>horizontal</code> prop.
							<br />
							On <m>mobile</m>, navigation controls are on a vertical bar on the left
							and it uses the <code>{'<MobileDrawer/>'}</code> component internally.
						</>
					}
					code={`import Dashboard from 'core/components/Dashboard'

<Dashboard
	path='/dashboard' // Parent path
	routes={[
		{		
			name: 'Page 1',
			id: 'page1', // Path of this page: /dashboard/page1
			page: Page1Component,
		},
		{		
			name: 'Page 2',
			id: 'page2', // Path of this page: /dashboard/page2
			page: Page2Component,
		}
	]}
	wrapperComponent={Wrapper}
/>

function Wrapper (props: { children: React.ReactNode }) {
	return (
		<div
			style={{
				paddingTop: 80,
				paddingBottom: 160,
				maxWidth: 1700,
			}}
		>
			{props.children}
		</div>
	)
}
`}
					title='Dashboard'
					top
					tags={['<Dashboard/>']}
				>
					<FButton
						onClick={async () => {
							props.toggleDashboardLayout()
						}}
						style={{
							minWidth: 50,
						}}
					>
						{!props.horizontalDashboard ? 'Top' : 'Side'} menu
					</FButton>
				</Section>
			)}
			<Section
				description={
					<>
						You can use the built-in CSS classes to build a <m>flex</m> layout easily.
					</>
				}
				code={`import styles from 'core/styles'
				
const fixedExample = {
	width: 200,
	height: 50,
	opacity: 0.1,
	backgroundColor: styles.colors.black,
}
const growExample = {
	flexGrow: 1,
	...fixedExample,
}

<div className='wrapMargin flex flex-wrap'>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
	<div style={growExample}></div>
	<div style={fixedExample}></div>
</div>`}
				title='Flex wrap/grow'
				tags={['flex', 'flex-wrap', 'wrapMargin']}
				top={!desktop}
			>
				<div style={{ ...styles.card }}>
					<div className='wrapMargin flex flex-wrap'>
						<div style={fixedExample}></div>
						<div style={growExample}></div>
						<div style={fixedExample}></div>
						<div style={growExample}></div>
						<div style={growExample}></div>
						<div style={fixedExample}></div>
						<div style={growExample}></div>
						<div style={fixedExample}></div>
					</div>
				</div>
			</Section>
			<Section
				description={
					<>
						You can use the built-in CSS classes to build a <m>grid</m> layout easily.
					</>
				}
				code={`import styles from 'core/styles'
				
const gridExample = {
	height: 50,
	opacity: 0.1,
	backgroundColor: styles.colors.black,
}

<div
	className='grid grid-cols-4'
>
	<div style={gridExample}></div>
	<div className='col-span-2' style={gridExample}></div>
	<div style={gridExample}></div>
	<div className='col-span-full' style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
	<div style={gridExample}></div>
</div>`}
				tags={['grid', 'grid-cols-N', 'col-span-N']}
				title='Grid'
			>
				<div
					className='wrapMargin grid grid-cols-4'
					style={{ ...styles.card, width: '100%' }}
				>
					<div style={gridExample}></div>
					<div className='col-span-2' style={gridExample}></div>
					<div style={gridExample}></div>
					<div className='col-span-full' style={gridExample}></div>
					<div style={gridExample}></div>
					<div style={gridExample}></div>
					<div style={gridExample}></div>
					<div style={gridExample}></div>
				</div>
			</Section>

			<Section
				description={
					<>
						To supply <m>data</m> to the table, use <code>data</code> prop which expects
						an array of objects.
						<br />
						To define the <m>table columns</m>, use <code>columns</code> prop. Each
						column has a <code>name</code> for the table header and a{' '}
						<code>selector</code> which maps a property of each data object to the
						column.
						<sp />
						Use <code>keySelector</code> prop to define a <m>main key</m> found in the
						data array. This key needs to be <m>unique</m> and usually is the id of each
						object or some other unique identifier.
						<sp />
						To <m>override or modify</m> the value displayed in a <m>specific column</m>
						, use the <code>cell</code> property when defining the column.
						<sp />
						<sp />
						The table component also has built-in <m>pagination</m>, <m>sorting</m>,{' '}
						<m>expandable rows</m> and is optimized for <m>large datasets</m>.
					</>
				}
				code={`import FTable from 'core/components/FTable'

const data = [
	{
		id: 1,
		name: 'John',
		percent: 0.26,
	},
	{
		id: 2,
		name: 'Jane',
		percent: 0.28
	}
]

<FTable
	data={data}
	keySelector='id'
	columns={[
		{		
			name: 'Name',
			selector: 'name'
		},
		{		
			name: 'Percentage',
			selector: 'percent',
			cell: (value) => <div>{value * 100}%</div>
		}
	]}
/>
`}
				title='Table'
				tags={['<FTable/>']}
				github='client/src/core/components/viewer/layout/Table.tsx'
			>
				<Table />
			</Section>

			<Section
				description={
					<>
						Use <code>currentPage</code> prop to set the <m>current</m> displayed page
						<br />
						Use <code>totalPages</code> prop to set the <m>total</m> number of pages
						<sp />
						The <code>onClick</code> prop is called when the page changes
					</>
				}
				code={`import { useState } from 'react'
import Paginate from 'core/components/Paginate'

const [page, setPage] = useState(1)

function MyComponent() {
	return (
		<Paginate
			onClick={async (e) => {
				setPage(e)
			}}
			totalPages={10}
			currentPage={page}
		/>
	)
}
`}
				title='Pagination'
				tags={['<Paginate/>']}
				github='client/src/core/components/viewer/layout/Pagination.tsx'
			>
				<Pagination />
			</Section>

			<Section
				description={
					<>
						The <code>{'<Modal/>'}</code> component is not <m>mounted</m> until {"it's"}{' '}
						displayed and where you place it in the component tree is <m>irrelevant</m>.
						<br />
						With the <code>content</code> prop you can set the content of the modal.
						<sp />
						Use <code>name</code> prop to define a <m>key</m> for the modal. This key
						will be expected to be in <code>this.state</code> and will be used to set if
						the modal is <m>closed</m> or <m>open</m>
						.
						<br />
						The <code>parent</code> prop is also <m>required</m> for the modal to access{' '}
						<code>this.state</code>.
						<sp />
						Use <code>title</code> prop to set the modal title.
						<br />
						Use <code>onClose</code> prop to define a function to be called when the
						modal is closed.
					</>
				}
				code={`import FButton from 'core/components/FButton'
import Modal, { useModal } from 'core/components/Modal'

function MyComponent () {
	const myModal = useModal()

	return (
		<>
			<Modal
				hook={myModal}
				title='Hello'
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<p>
								Are you sure?
							</p>
						</Content>
						
						<Buttons>
							<FButton onClick={close}>Cancel</FButton>

							<FButton appearance='primary' onClick={() => {
								alert('Hello!')
								close()
							}}>
								Proceed
							</FButton>
						</Buttons>
					</Parent>
				)}
			/>
			
			<button type='button' onClick={() => {
				myModal.setOpen(true)
			}}>
				Open
			</button>
		</>
	)
}
`}
				title='Modal'
				tags={['useModal', '<Modal/>']}
				github='client/src/core/components/viewer/layout/Modal.tsx'
			>
				<Modal />
			</Section>

			<Section
				description={
					<>
						A toast can be triggered from anywhere using the <code>global.addFlag</code>{' '}
						function.
						<sp />
						It can be closed by the <m>user</m> or <m>automatically</m> after a certain
						amount of time.
						<br />
						{"There's"} also different title colors depending on the type of the toast
						like <m>success</m>, <m>error</m> or <m>warning</m>.
						<sp />
						Toasts use <code>react-toastify</code> internally.
					</>
				}
				code={`global.addFlag('This is a notification', 
	'Optional description...',
	'default', // Style
	{
		closeAfter: 2000, // In milliseconds
	}
)
`}
				title='Toast'
				tags={['global.addFlag()']}
				github='client/src/core/components/viewer/layout/Toast.tsx'
			>
				<Toast />
			</Section>

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
				github='client/src/core/components/viewer/layout/Chart.tsx'
			>
				<Chart />
			</Section>

			<Section
				description={
					<>
						Use <code>trigger</code> prop to display the element that will{' '}
						<m>expand/collapse</m> the <m>content</m>.
						<sp />
						Use <code>content</code> prop to display the content when the component is{' '}
						<m>expanded</m>.
					</>
				}
				code={`import Collapsible from 'core/components/Collapsible'

<Collapsible
	trigger={() => (
		<div>Open</div>
	)}
	content={(set) => (
		<div>
			Hidden Conent
		</div>
	)}
></Collapsible>
`}
				title='Collapse'
				tags={['<Collapsible/>', '<Animated/>']}
				github='client/src/core/components/viewer/layout/Collapse.tsx'
			>
				<Collapse />
			</Section>

			<Section
				description={
					<>
						To make an element <m>sticky</m> across a <m>section</m> in your page, add a{' '}
						<m>unique</m> CSS class like <code>sticky_boundary</code> in the section{' '}
						<m>parent</m> and then use the <code>{'<Sticky/>'}</code> component as{' '}
						<m>one</m> of the children.
						<br />
						For the <code>boundaryElement</code> prop, supply it with the <m>same</m>{' '}
						unique CSS class you used in the parent.
						<sp />
						The children of <code>{'<Sticky/>'}</code> will <m>stay in place</m> as you{' '}
						<m>scroll</m> vertically in that section.
					</>
				}
				title='Sticky'
				tags={['react-sticky-el']}
				github='client/src/core/components/viewer/layout/Sticky.tsx'
			>
				<Sticky />
			</Section>

			<Next backName='Style' backLink='style' name='Inputs' link='inputs' />
		</div>
	)
}
