/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CodeBlock from 'core/components/CodeBlock'
import OutsideAlerter from 'core/components/OutsideAlerter'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import React from 'react'
import MediaQuery from 'react-responsive'

const code = (color: string) => (
	<svg
		width='30'
		height='30'
		viewBox='0 0 212 212'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			fill={color}
			d='M60.6214 156.35C58.0269 156.354 55.5217 155.403 53.583 153.679L-0.0529785 106L56.5616 55.6712C58.6719 53.8659 61.4063 52.9609 64.1768 53.1508C66.9474 53.3406 69.5328 54.6101 71.3771 56.6863C73.2214 58.7625 74.1773 61.4796 74.0391 64.2532C73.901 67.0269 72.6799 69.6355 70.6384 71.5182L31.853 106L67.6598 137.821C69.2685 139.249 70.4049 141.131 70.9183 143.22C71.4316 145.308 71.2975 147.504 70.5338 149.514C69.7701 151.525 68.4129 153.255 66.6424 154.476C64.872 155.697 62.772 156.351 60.6214 156.35V156.35ZM155.438 156.329L212.053 106L158.417 58.3212C156.316 56.4545 153.559 55.499 150.753 55.665C147.947 55.831 145.322 57.1048 143.455 59.2063C141.588 61.3077 140.633 64.0646 140.799 66.8705C140.965 69.6764 142.239 72.3015 144.34 74.1682L180.147 106L141.362 140.471C139.259 142.338 137.984 144.963 137.817 147.77C137.65 150.577 138.605 153.336 140.471 155.438C142.338 157.541 144.964 158.816 147.77 158.983C150.577 159.15 153.336 158.195 155.438 156.329V156.329ZM105.852 171.349L127.052 44.149C127.323 42.7588 127.312 41.3284 127.021 39.9423C126.73 38.5562 126.165 37.2424 125.357 36.0786C124.55 34.9149 123.518 33.9247 122.321 33.1665C121.125 32.4084 119.789 31.8977 118.392 31.6647C116.995 31.4316 115.565 31.4808 114.188 31.8095C112.81 32.1382 111.512 32.7397 110.371 33.5784C109.229 34.417 108.268 35.476 107.543 36.6925C106.817 37.9091 106.343 39.2587 106.148 40.6616L84.9484 167.862C84.6773 169.252 84.6876 170.682 84.9786 172.068C85.2696 173.454 85.8354 174.768 86.6427 175.932C87.4499 177.096 88.4822 178.086 89.6786 178.844C90.8749 179.602 92.2111 180.113 93.6081 180.346C95.0051 180.579 96.4347 180.53 97.8124 180.201C99.1901 179.872 100.488 179.271 101.629 178.432C102.771 177.594 103.732 176.535 104.457 175.318C105.183 174.101 105.657 172.752 105.852 171.349V171.349Z'
		/>
	</svg>
)

type Props = {
	containerStyle?: React.CSSProperties
	codeStyle?: React.CSSProperties
	className?: string
	data: string
	lang: 'json' | 'jsx' | 'tsx' | 'html'
}
export default class CodeCollapse extends React.Component<Props> {
	constructor(props: Props) {
		super(props)

		this.setWrapperRef = this.setWrapperRef.bind(this)
	}
	timer: ReturnType<typeof setTimeout> | undefined = undefined

	state = {
		isOpen: false,
	}

	wrapperRef: HTMLElement | null = null
	setWrapperRef(instance: HTMLElement | null) {
		this.wrapperRef = instance
	}

	componentWillUnmount() {
		if (this.timer) clearTimeout(this.timer)
	}

	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<OutsideAlerter
						delay
						clickedOutside={() => {
							this.setState({ isOpen: false })
						}}
					>
						<div ref={this.setWrapperRef} className={this.props.className}>
							<div className={'flex-col items-end'}>
								<div
									style={{ width: desktop ? 0 : undefined }}
									className={'flex-col items-end'}
								>
									<Tooltip
										tooltipProps={{ placement: 'left' }}
										content='Show code'
									>
										<button
											type='button'
											onClick={() => {
												if (!this.state.isOpen) {
													if (this.timer) clearTimeout(this.timer)
													this.timer = setTimeout(
														() =>
															window.scrollTo({
																top:
																	this.wrapperRef!.offsetTop -
																	100,
																behavior: 'smooth',
															}),
														400
													)
												}
												this.setState({ isOpen: !this.state.isOpen })
											}}
											style={{
												display: 'flex',
												alignItems: 'center',
											}}
										>
											<tag>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														width: 23,
														height: 23,
													}}
												>
													{code(
														this.state.isOpen
															? styles.colors.main
															: config.replaceAlpha(
																	styles.colors.black,
																	0.5
															  )
													)}
												</div>
											</tag>
										</button>
									</Tooltip>
								</div>
								<div style={{ alignSelf: 'center', width: '100%', maxWidth: 600 }}>
									<div style={{ minHeight: 5 }}></div>
									<CodeBlock
										visible={this.state.isOpen}
										style={this.props.codeStyle}
										containerStyle={this.props.containerStyle}
										noPrettier
										lang={this.props.lang}
										data={this.props.data}
									/>
								</div>
							</div>
						</div>
					</OutsideAlerter>
				)}
			</MediaQuery>
		)
	}
}
