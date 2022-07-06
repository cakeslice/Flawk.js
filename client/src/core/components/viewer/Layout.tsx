/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import FButton from 'core/components/FButton'
import Chart from 'core/components/viewer/layout/Chart'
import Modal from 'core/components/viewer/layout/Modal'
import Table from 'core/components/viewer/layout/Table'
import config from 'core/config'
import styles from 'core/styles'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Sticky from 'react-sticky-el'
import Collapsible from '../Collapsible'
import { Next, Section } from './ComponentsViewer'

// <Sticky/> breaks if we use React.lazy()

/* const Table = React.lazy(() => import('core/components/viewer/layout/Table'))
const Modal = React.lazy(() => import('core/components/viewer/layout/Modal'))
const Chart = React.lazy(() => import('core/components/viewer/layout/Chart')) */

//

type Props = { horizontalDashboard: boolean; toggleDashboardLayout: () => void }
export default function Layout(props: Props) {
	const [collapse, setCollapse] = useState(false)

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

class Wrapper extends Component<{ children: React.ReactNode }> {
	render() {
		return (
			<div
				style={{
					paddingTop: 80,
					paddingBottom: 160,
					maxWidth: 1700,
				}}
			>
				{this.props.children}
			</div>
		)
	}
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
				code={`const fixedExample = {
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
				code={`const gridExample = {
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

			<Table />

			<Modal />

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
				code={`<button
	type='button'
	onClick={() =>
		global.addFlag(
			'This is a notification',
			undefined,
			'default',
			{
				closeAfter: 2000, // In milliseconds
			}
		)
	}
>
	Show Toast
</button>
`}
				title='Toast'
				tags={['global.addFlag()']}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FButton
						onClick={() =>
							global.addFlag('Uploading file...', undefined, 'default', {
								closeAfter: 2000,
							})
						}
					>
						Default
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag(
								'New message',
								(p) => (
									<div>
										<div>
											<b>Chris:</b> Have you heard about the new Tesla?
										</div>
										<sp />
										<div className='flex justify-end'>
											<FButton onClick={p.closeToast}>Reply</FButton>
										</div>
									</div>
								),
								'info',
								{
									playSound: true,
								}
							)
						}
					>
						Info
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag('Your changes were saved', undefined, 'success', {
								closeAfter: 2000,
								playSound: true,
							})
						}
					>
						Success
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag(
								'Warning',
								'There is out-of-sync data you need to review to continue',
								'warning',
								{
									closeAfter: 5000,
									playSound: true,
								}
							)
						}
					>
						Warning
					</FButton>
					<FButton
						onClick={() =>
							global.addFlag('Error', 'File upload failed', 'error', {
								playSound: true,
							})
						}
					>
						Error
					</FButton>
				</div>
			</Section>

			<Chart />

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
			>
				<div style={{ ...styles.card, width: desktop ? 400 : '100%' }}>
					<div>
						<FButton onClick={() => setCollapse((prev) => !prev)}>
							{collapse ? 'Close' : 'Expand'}
						</FButton>
						<sp />
						<Animated
							controlled={collapse}
							effects={['fade', 'height']}
							duration={0.25}
							style={{
								overflow: 'visible',
								pointerEvents: collapse ? 'auto' : 'none',
							}}
						>
							<div
								className='flex-col'
								style={{
									...styles.outlineCard,
									width: desktop ? 300 : '100%',
								}}
							>
								<p>Content</p>
								<sp />
								<div style={{ alignSelf: 'flex-end' }}>
									<FButton onClick={() => setCollapse(false)}>{'Close'}</FButton>
								</div>
							</div>
						</Animated>
					</div>
					<sp />
					<Collapsible
						trigger={(isOpen, set) => (
							<b
								style={{
									color: isOpen ? styles.colors.main : undefined,
								}}
							>
								What is this component for?
							</b>
						)}
						content={(set) => (
							<div
								style={{
									paddingTop: 15,
									paddingLeft: 25,
								}}
							>
								It expands and shows hidden content
							</div>
						)}
					></Collapsible>
				</div>
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
				code={`import Sticky from 'react-sticky-el'

<div className='grid grid-cols-2 sticky_boundary'>
	<Sticky
		topOffset={-80}
		bottomOffset={80}
		stickyStyle={{ marginTop: 80 }}
		boundaryElement='.sticky_boundary'
	>
		<div
			style={{
				height: 200,
				width: 'auto',
			}}
		>
			This element is sticky in this section
		</div>
	</Sticky>

	<div>
		<div style={{ height: 400, width: 'auto' }}>Card #1</div>
		<sp />
		<div style={{ height: 400, width: 'auto' }}>Card #2</div>
		<sp />
		<div style={{ height: 400, width: 'auto' }}>Card #3</div>
	</div>
</div>
`}
				title='Sticky'
				tags={['react-sticky-el']}
			>
				<div
					className={
						desktop ? 'grid grid-cols-2 sticky_boundary' : 'flex-col sticky_boundary'
					}
				>
					<Sticky
						topOffset={desktop ? -80 : -80}
						bottomOffset={desktop ? 80 : 80}
						stickyStyle={{ marginTop: desktop ? 80 : 80 }}
						boundaryElement='.sticky_boundary'
					>
						<div
							style={{
								...styles.card,
								height: 200,
								width: 'auto',
							}}
						>
							This element is sticky in this section
						</div>
					</Sticky>
					{!desktop && <sp />}
					<div>
						<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #1</div>
						<sp />
						<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #2</div>
						<sp />
						<div style={{ ...styles.card, height: 400, width: 'auto' }}>Card #3</div>
					</div>
				</div>
			</Section>

			<Next backName='Style' backLink='style' name='Inputs' link='inputs' />
		</div>
	)
}
