/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

type Props = {
	location: Location
}

class ScrollToTop extends Component<Props & RouteComponentProps> {
	constructor(props: Props & RouteComponentProps) {
		super(props)

		global.scrollToTop = this.scrollToTop.bind(this)
	}

	scrollToTop() {
		window.scrollTo(0, 0)
	}

	componentDidUpdate(prevProps: Props) {
		if (this.props.location !== prevProps.location) {
			this.scrollToTop()
		}
	}

	render() {
		return this.props.children
	}
}
export default withRouter(ScrollToTop)
