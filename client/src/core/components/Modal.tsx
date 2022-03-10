/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clearAllBodyScrollLocks } from 'body-scroll-lock'
import Animated from 'core/components/Animated'
import TrackedComponent from 'core/components/TrackedComponent'
import config from 'core/config'
import styles from 'core/styles'
import { Obj } from 'flawk-types'
import React, { Component } from 'react'
import FocusLock from 'react-focus-lock'
import { Portal } from 'react-portal'
import MediaQuery from 'react-responsive'

type HeaderStyle = React.CSSProperties & {
	line?: boolean
	lineColor?: React.CSSProperties['background']
	noCloseButton?: boolean
	textStyle?: React.CSSProperties
}

type Props = {
	title?: React.ReactNode
	content: (
		close: () => void,
		Content: React.FC,
		Buttons: React.FC,
		Parent: React.FC,
		Header: React.FC
	) => React.ReactNode
	// Props to set modal state on the parent component on close automatically
	name?: string
	//
	style?: React.CSSProperties
	headerStyle?: HeaderStyle
	contentStyle?: React.CSSProperties
	buttonsStyle?: React.CSSProperties & {
		line: boolean
	}
	noAutoFocus?: boolean
} & (
	| {
			parent: Component
			visible?: undefined
			onClose?: (fromHeader: boolean) => void
	  }
	| {
			parent?: undefined
			// To set modal state manually
			visible?: boolean
			onClose: (fromHeader: boolean) => void
	  }
)
export default class Modal extends TrackedComponent<Props> {
	trackedName = 'Modal'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
	}

	state = {
		parentState: false,
	}

	constructor(props: Props) {
		super(props)

		this.onClose = this.onClose.bind(this)
		this.renderContent = this.renderContent.bind(this)
		this.renderButtons = this.renderButtons.bind(this)
		this.renderParent = this.renderParent.bind(this)
		this.renderHeader = this.renderHeader.bind(this)
	}

	onVisible() {
		if (!config.appleBrowser) config.disableScroll()
	}

	componentDidMount() {
		if (!this.props.parent || !this.props.name) {
			if (this.props.visible) this.onVisible()
		} else {
			// @ts-ignore
			// eslint-disable-next-line
			this.state.parentState = this.props.parent.state[this.props.name]

			if (this.state.parentState) {
				this.onVisible()
			}
		}
	}
	componentDidUpdate(prevProps: Props) {
		if (
			this.props.parent &&
			this.props.name &&
			// @ts-ignore
			this.props.parent.state[this.props.name] !== this.state.parentState
		) {
			// @ts-ignore
			// eslint-disable-next-line
			this.state.parentState = this.props.parent.state[this.props.name]

			if (this.state.parentState) {
				this.onVisible()
			} else {
				clearAllBodyScrollLocks()
			}
		}
		if (this.props.visible !== prevProps.visible && this.props.visible) {
			if (this.props.visible) {
				this.onVisible()
			} else {
				clearAllBodyScrollLocks()
			}
		}
	}
	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	onClose(fromHeader = false) {
		this.props.onClose && this.props.onClose(fromHeader)

		if (this.props.parent && this.props.name) {
			const s: Obj = {}
			s[this.props.name] = false
			this.props.parent.setState(s)
		}

		clearAllBodyScrollLocks()
	}

	renderHeader: React.FC = ({ children }) => {
		const modalPadding = styles.modalPadding || 20

		return (
			<ModalHeader
				modalPadding={modalPadding}
				headerStyle={this.props.headerStyle}
				title={children}
				onClose={this.onClose}
			/>
		)
	}
	renderParent: React.FC = ({ children }) => {
		return (
			<div
				style={{
					display: 'contents',
				}}
			>
				{children}
			</div>
		)
	}
	renderContent: React.FC = ({ children }) => {
		const modalPadding = styles.modalPadding || 20
		const modalWrapper: React.CSSProperties = {
			padding: modalPadding,
			paddingTop: modalPadding,
			paddingBottom: modalPadding,
			overflow: 'auto',
		}

		return (
			<div
				style={{
					...modalWrapper,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					...(styles.modalContentStyle && styles.modalContentStyle),
					...(this.props.contentStyle && this.props.contentStyle),
				}}
			>
				{children}
			</div>
		)
	}
	renderButtons: React.FC = ({ children }) => {
		const modalPadding = styles.modalPadding || 20

		return (
			<div>
				{((!this.props.buttonsStyle &&
					styles.modalButtonsStyle &&
					(styles.modalButtonsStyle.line === undefined ||
						styles.modalButtonsStyle.line)) ||
					(this.props.buttonsStyle &&
						(this.props.buttonsStyle.line === undefined ||
							this.props.buttonsStyle.line))) && (
					<div>
						<div
							style={{
								height: 1,
								background:
									(styles.modalButtonsStyle &&
										styles.modalButtonsStyle.lineColor) ||
									styles.colors.black,
								opacity:
									styles.modalButtonsStyle && styles.modalButtonsStyle.lineColor
										? 1
										: 0.1,
								width: '100%',
							}}
						></div>
					</div>
				)}
				<div
					className={styles.modalButtonWrap ? 'wrapMargin' : undefined}
					style={{
						padding: modalPadding - 5,
						paddingBottom: modalPadding / 2 - 5,
						paddingTop: modalPadding / 2 - 5,
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'flex-end',
						...(styles.modalButtonsStyle && styles.modalButtonsStyle),
						...(this.props.buttonsStyle && this.props.buttonsStyle),
					}}
				>
					{children}
				</div>
			</div>
		)
	}

	render() {
		const modalPadding = styles.modalPadding || 20

		return (
			<Portal>
				<Animated
					trackedName='Modal'
					className='scrollTarget'
					controlled={
						this.props.parent && this.props.name
							? // @ts-ignore
							  this.props.parent.state[this.props.name] === true
								? true
								: false
							: this.props.visible !== undefined
							? this.props.visible
							: undefined
					}
					style={{
						backdropFilter: 'blur(2px)',
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 99,
						background:
							styles.modalBackground ||
							config.replaceAlpha(
								global.nightMode ? styles.colors.white : 'rgba(127,127,127,1)',
								global.nightMode ? 0.5 : 0.25
							),
					}}
					animateOffscreen
					effects={['fade']}
					duration={0.25}
				>
					<MediaQuery minWidth={config.mobileWidthTrigger}>
						{(desktop) => (
							<FocusLock>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<div
										className='flex justify-center items-center'
										style={{
											padding: 10,
											paddingBottom: 30,
											paddingTop: 30,
											position: 'fixed',
											top: 0,
											bottom: 0,
											left: 0,
											right: 0,
										}}
									>
										<div
											style={{
												...styles.card,
												...{
													width: styles.modalWidth || 500,
													boxShadow: styles.strongerShadow,
													margin: 0,
													borderRadius: 5,
													minHeight: 20,
													display: 'flex',
													flexDirection: 'column',
													justifyContent: 'space-between',
													padding: 0,
													maxWidth: '100%',
													maxHeight: '100%',
													...(styles.modalCard && styles.modalCard()),
													...this.props.style,
												},
											}}
										>
											{this.props.title !== undefined && (
												<ModalHeader
													modalPadding={modalPadding}
													headerStyle={this.props.headerStyle}
													title={this.props.title}
													onClose={this.onClose}
												/>
											)}

											{this.props.content
												? this.props.content(
														this.onClose,
														this.renderContent,
														this.renderButtons,
														this.renderParent,
														this.renderHeader
												  )
												: undefined}
										</div>
									</div>
								</div>
							</FocusLock>
						)}
					</MediaQuery>
				</Animated>
			</Portal>
		)
	}
}
class ModalHeader extends Component<{
	title?: React.ReactNode
	headerStyle?: HeaderStyle
	modalPadding: number
	onClose?: (fromHeader: boolean) => void
}> {
	render() {
		return (
			<>
				<div
					className='flex justify-between items-center'
					style={{
						padding: this.props.modalPadding / 2,
						paddingLeft: this.props.modalPadding,
						...styles.modalHeaderStyle,
						...this.props.headerStyle,
					}}
				>
					<div
						style={{
							...{
								letterSpacing: 0.4,
								maxWidth: '90%',
								...(styles.modalHeaderStyle && styles.modalHeaderStyle.textStyle),
								...(this.props.headerStyle && this.props.headerStyle.textStyle),
							},
						}}
					>
						{this.props.title}
					</div>
					{((styles.modalHeaderStyle && !styles.modalHeaderStyle.noCloseButton) ||
						(this.props.headerStyle &&
							(this.props.headerStyle.noCloseButton === undefined ||
								this.props.headerStyle.noCloseButton === false))) && (
						<button
							type='button'
							style={{
								borderRadius: 5,
								height: 24,
								background: 'transparent',
							}}
							onClick={() => this.props.onClose && this.props.onClose(true)}
						>
							<div
								style={{
									opacity: 0.5,
								}}
							>
								{close(styles.colors.black)}
							</div>
						</button>
					)}
				</div>
				{((!this.props.headerStyle &&
					styles.modalHeaderStyle &&
					(styles.modalHeaderStyle.line === undefined || styles.modalHeaderStyle.line)) ||
					(this.props.headerStyle &&
						(this.props.headerStyle.line === undefined ||
							this.props.headerStyle.line))) && (
					<div
						style={{
							height: 2,
							background:
								(this.props.headerStyle && this.props.headerStyle.lineColor) ||
								styles.modalHeaderStyle.lineColor ||
								styles.colors.black,
							opacity:
								(this.props.headerStyle && this.props.headerStyle.lineColor) ||
								styles.modalHeaderStyle.lineColor
									? 1
									: 0.1,
							width: '100%',
						}}
					></div>
				)}
			</>
		)
	}
}

const close = (color: string) => {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M4.29301 18.2931L10.586 12.0001L4.29301 5.70708C4.11085 5.51848 4.01006 5.26588 4.01234 5.00368C4.01461 4.74148 4.11978 4.49067 4.30519 4.30526C4.4906 4.11985 4.74141 4.01469 5.00361 4.01241C5.26581 4.01013 5.51841 4.11092 5.70701 4.29308L12 10.5861L18.293 4.29308C18.3853 4.19757 18.4956 4.12139 18.6176 4.06898C18.7396 4.01657 18.8708 3.98898 19.0036 3.98783C19.1364 3.98668 19.2681 4.01198 19.391 4.06226C19.5139 4.11254 19.6255 4.18679 19.7194 4.28069C19.8133 4.37458 19.8876 4.48623 19.9378 4.60913C19.9881 4.73202 20.0134 4.8637 20.0123 4.99648C20.0111 5.12926 19.9835 5.26048 19.9311 5.38249C19.8787 5.50449 19.8025 5.61483 19.707 5.70708L13.414 12.0001L19.707 18.2931C19.8025 18.3853 19.8787 18.4957 19.9311 18.6177C19.9835 18.7397 20.0111 18.8709 20.0123 19.0037C20.0134 19.1365 19.9881 19.2681 19.9378 19.391C19.8876 19.5139 19.8133 19.6256 19.7194 19.7195C19.6255 19.8134 19.5139 19.8876 19.391 19.9379C19.2681 19.9882 19.1364 20.0135 19.0036 20.0123C18.8708 20.0112 18.7396 19.9836 18.6176 19.9312C18.4956 19.8788 18.3853 19.8026 18.293 19.7071L12 13.4141L5.70701 19.7071C5.51841 19.8892 5.26581 19.99 5.00361 19.9878C4.74141 19.9855 4.4906 19.8803 4.30519 19.6949C4.11978 19.5095 4.01461 19.2587 4.01234 18.9965C4.01006 18.7343 4.11085 18.4817 4.29301 18.2931Z'
				fill={color}
			/>
		</svg>
	)
}
