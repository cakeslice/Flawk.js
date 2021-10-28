/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock'
import React, { Component } from 'react'
import { Animated } from 'react-animated-css'
import { Portal } from 'react-portal'
import CustomButton from './CustomButton'

var styles = require('core/styles').default
var config = require('core/config_').default
export default class GenericModal extends Component {
	componentDidMount() {
		disableBodyScroll(document.querySelector('.scrollTarget'))
	}
	componentWillUnmount() {
		clearAllBodyScrollLocks()
	}

	onClose() {
		this.props.onClose && this.props.onClose()
		var s = {}
		s[this.props.name] = false
		this.props.parent.setState(s)
	}

	renderButtons() {
		var modalPadding = styles.modalPadding || 20

		return (
			this.props.buttons &&
			this.props.buttons.length > 0 && (
				<div>
					{styles.modalButtonsStyle && styles.modalButtonsStyle.line && (
						<div>
							<div
								style={{
									height: 1,
									background: this.props.lineColor || styles.colors.black,
									opacity: this.props.lineColor ? 1 : 0.1,
									width: '100%',
								}}
							></div>
						</div>
					)}
					<div
						className={styles.modalButtonWrap && 'wrapMargin'}
						style={{
							padding: modalPadding - 5,
							paddingBottom: modalPadding / 2 - 5,
							paddingTop: modalPadding / 2 - 5,
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'flex-end',
							...(styles.modalButtonsStyle && styles.modalButtonsStyle),
						}}
					>
						{this.props.buttons.map((b, i) =>
							b.override ? (
								<div
									style={{
										...(styles.modalButtonsStyle &&
											styles.modalButtonsStyle.buttonStyle),
										...b.style,
									}}
								>
									{b.override(this.onClose.bind(this))}
								</div>
							) : (
								<CustomButton
									key={i}
									appearance={b.appearance || (!b.cancel ? 'primary' : undefined)}
									type={b.submit ? 'submit' : undefined}
									style={{
										...(styles.modalButtonsStyle &&
											styles.modalButtonsStyle.buttonStyle),
										...b.style,
									}}
									isLoading={false}
									onClick={
										b.cancel
											? () => {
													this.onClose()
													b.action && b.action()
											  }
											: () => {
													b.action && b.action(this.onClose.bind(this))
											  }
									}
								>
									{b.cancel ? config.text('common.cancel') : b.title}
								</CustomButton>
							)
						)}
					</div>
				</div>
			)
		)
	}

	render() {
		var modalPadding = styles.modalPadding || 20
		var modalWrapper = {
			padding: modalPadding,
			paddingTop: styles.modalHeader || this.props.title ? modalPadding / 2 : modalPadding,
			paddingBottom:
				this.props.buttons && this.props.buttons.length > 0
					? modalPadding / 2
					: modalPadding,
			overflow: !this.props.noOverflow && 'auto',
		}

		return (
			<Portal>
				<div
					style={{
						//backdropFilter: 'blur(2px)', // ! Bad for performance
						background:
							styles.modalBackground ||
							config.replaceAlpha(
								global.nightMode ? styles.colors.white : 'rgba(127,127,127,1)',
								'.25'
							),
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 99,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{!this.props.noAutoFocus && (
						<button autoFocus={true} style={{ maxWidth: 0, maxHeight: 0 }}></button>
					)}
					<Animated animationIn='fadeIn' animationInDuration={500}>
						<div style={{ margin: 10 }}>
							<div
								className='scrollTarget'
								style={{
									...styles.card,
									...{
										boxShadow: styles.strongerShadow,
										overflowY: this.props.noOverflow && 'auto',
										margin: 0,
										borderRadius: 5,
										maxWidth: 'calc(100vw - 10px)',
										maxHeight: 'calc(100vh - 100px)', // ! Needs to be like this to compensate for browser bars
										minHeight: 20,
										width: styles.modalWidth || 500,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										padding: 0,
										...this.props.style,
									},
								}}
							>
								{(styles.modalHeader || this.props.title) && (
									<ModalHeader
										modalPadding={modalPadding}
										lineColor={this.props.style && this.props.style.lineColor}
										title={this.props.title}
										onClose={this.onClose.bind(this)}
									/>
								)}

								{this.props.title ||
								(this.props.buttons && this.props.buttons.length > 0) ? (
									this.props.content(
										this.onClose.bind(this),
										{ display: 'contents' },
										modalWrapper,
										this.renderButtons.bind(this)
									)
								) : (
									<div style={{ ...modalWrapper }}>
										{this.props.content(this.onClose.bind(this))}
									</div>
								)}
							</div>
						</div>
					</Animated>
				</div>
			</Portal>
		)
	}
}
class ModalHeader extends Component {
	close = (color) => {
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

	render() {
		return (
			<div className='flex-col justify-center'>
				<div
					className='flex justify-between items-center'
					style={{
						padding: this.props.modalPadding / 2,
						paddingLeft: this.props.modalPadding,
						...styles.modalHeaderStyle,
					}}
				>
					<div
						style={{
							...{
								letterSpacing: 0.4,
								...(styles.modalHeaderStyle && styles.modalHeaderStyle.textStyle),
							},
						}}
					>
						{this.props.title}
					</div>
					{styles.modalHeaderStyle && !styles.modalHeaderStyle.noCloseButton && (
						<button
							style={{
								borderRadius: 5,
								height: 24,
								opacity: 0.5,
								background: 'transparent',
							}}
							onClick={this.props.onClose}
						>
							{this.close(styles.colors.black)}
						</button>
					)}
				</div>
				{styles.modalHeaderStyle && styles.modalHeaderStyle.line && (
					<div
						style={{
							height: 1,
							background: this.props.lineColor || styles.colors.black,
							opacity: this.props.lineColor ? 1 : 0.1,
							width: '100%',
						}}
					></div>
				)}
			</div>
		)
	}
}
