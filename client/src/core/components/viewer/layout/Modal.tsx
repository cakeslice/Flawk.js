/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Dropdown from 'core/components/Dropdown'
import ExitPrompt from 'core/components/ExitPrompt'
import FButton from 'core/components/FButton'
import Field from 'core/components/Field'
import FInput from 'core/components/FInput'
import Modal, { useModal } from 'core/components/Modal'
import Tooltip from 'core/components/Tooltip'
import { Section } from 'core/components/viewer/ComponentsViewer'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { useMediaQuery } from 'react-responsive'

export default function _Modal() {
	const confirmModal = useModal()

	const exampleModalHook = useModal()
	function exampleModal() {
		return (
			<Modal
				closeOnOutsideClick
				hook={exampleModalHook}
				title={'Title'}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<div className='wrapMargin flex flex-wrap justify-start items-end'>
								<FInput label='Date' foreground datePicker></FInput>
								<Dropdown
									foreground
									options={[
										{ value: '1', label: 'Option 1' },
										{ value: '2', label: 'Option 2' },
									]}
								></Dropdown>
								<Tooltip
									foreground
									content={
										<p>
											Lorem ipsum dolor sit amet, adipiscing elit, sed do
											eiusmod tempor ut labore et dolore magna aliqua. Ut enim
											ad minim veniam, quis nostrud exercitation ullamco
											laboris nisi ut aliquip ex ea commodo.
										</p>
									}
								>
									<tag>Tooltip</tag>
								</Tooltip>
							</div>
						</Content>
						<Buttons>
							<FButton appearance='primary' onClick={close}>
								Button
							</FButton>
						</Buttons>
					</Parent>
				)}
			/>
		)
	}

	const bigModalHook = useModal()
	function bigModal() {
		return (
			<Modal
				closeOnOutsideClick
				hook={bigModalHook}
				big
				title={'Register'}
				content={(close, Content, Buttons, Parent) => (
					<Formik
						enableReinitialize
						initialValues={
							{ checkbox: false } as {
								email?: string
								password?: string
								phone?: string
								firstName?: string
								lastName?: string
								checkbox: boolean
							}
						}
						onSubmit={async (values, { setSubmitting }) => {
							setSubmitting(true)

							await config.sleep(500)
							close()

							setSubmitting(false)
						}}
					>
						{({ handleReset, isSubmitting, dirty, errors }) => {
							return (
								<Form noValidate>
									<ExitPrompt dirty={dirty} noRouter />

									<Content>
										<div className='wrapMargin flex flex-wrap justify-start'>
											<Field
												component={FInput}
												required
												type={'text'}
												name='firstName'
												label={config.text('auth.firstName')}
											/>
											<Field
												component={FInput}
												required
												type={'text'}
												name='lastName'
												label={config.text('auth.lastName')}
											/>
										</div>
										<sp />
										<div className='wrapMargin flex flex-wrap justify-start'>
											<FInput label='Date' foreground datePicker></FInput>
											<Dropdown
												label={'Dropdown'}
												foreground
												options={[
													{ value: '1', label: 'Option 1' },
													{ value: '2', label: 'Option 2' },
												]}
											></Dropdown>
										</div>
										<div style={{ minHeight: 1500 }} />
									</Content>
									<Buttons>
										<FButton onClick={close}>Cancel</FButton>
										<FButton
											{...(isSubmitting ? { isLoading: true } : {})}
											appearance='primary'
											formErrors={errors}
											type='submit'
										>
											Add Item
										</FButton>
									</Buttons>
								</Form>
							)
						}}
					</Formik>
				)}
			/>
		)
	}

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<>
			{exampleModal()}
			{bigModal()}
			<Modal
				closeOnOutsideClick
				hook={confirmModal}
				title={
					<div>
						Delete <b>Chris</b>
					</div>
				}
				content={(close, Content, Buttons, Parent) => (
					<Parent>
						<Content>
							<p>
								Are you sure you want to delete user <b>Chris</b>?
							</p>
							<sp />
							<b style={{ color: styles.colors.red }}>
								This action cannot be reverted
							</b>
						</Content>
						<Buttons>
							<FButton onClick={close}>Cancel</FButton>
							<FButton appearance='delete_primary' onClick={close}>
								Delete
							</FButton>
						</Buttons>
					</Parent>
				)}
			/>

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
				code={`import Modal from 'core/components/Modal'

state = {
	myModal: false
}

<>
	<Modal
		name='myModal' // Name needs to match the key in this.state
		parent={this}
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
		this.setState({ myModal: true })
	}}>
		Open
	</button>
</>
`}
				title='Modal'
				tags={['<Modal/>']}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FButton onClick={() => exampleModalHook.setOpen(true)}>Default</FButton>
					<FButton appearance='delete' onClick={() => confirmModal.setOpen(true)}>
						Delete
					</FButton>
					<FButton onClick={() => bigModalHook.setOpen(true)}>Big</FButton>
				</div>
			</Section>
		</>
	)
}
