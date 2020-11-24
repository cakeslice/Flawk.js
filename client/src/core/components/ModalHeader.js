/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react'

var styles = require('core/styles').default
var config = require('core/config_').default

export default class ModalHeader extends Component {
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
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: 15,
						paddingRight: 20,
						paddingLeft: 20,
						paddingBottom: 0,
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
				>
					<p
						style={{
							...{
								textAlign: 'center',
								letterSpacing: 0.4,
								paddingBottom: 10,
							},
						}}
					>
						{this.props.title}
					</p>

					<button
						style={{
							borderRadius: 5,
							marginLeft: 30,
							marginBottom: 10,
							height: 24,
							opacity: 0.5,
							background: 'transparent',
						}}
						onClick={this.props.onClose}
					>
						{this.close(styles.colors.black)}
					</button>
				</div>
				<div
					style={{
						height: 1,
						background: styles.colors.black,
						opacity: 0.1,
						width: '100%',
					}}
				></div>
			</div>
		)
	}
}
