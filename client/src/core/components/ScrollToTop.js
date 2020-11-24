/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from 'react'
import { withRouter } from 'react-router'

class ScrollToTop extends Component {
	constructor() {
		super()

		global.scrollToTop = this.scrollToTop
	}

	scrollToTop() {
		window.scrollTo(0, 0)
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			this.scrollToTop()
		}
	}

	render() {
		return this.props.children
	}
}
export default withRouter(ScrollToTop)
