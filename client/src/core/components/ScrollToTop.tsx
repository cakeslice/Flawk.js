/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import navigation from 'core/functions/navigation'
import { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

type Props = {
	location: Location
}

class ScrollToTop extends Component<Props & RouteComponentProps> {
	constructor(props: Props & RouteComponentProps) {
		super(props)
	}

	scrollToTop() {
		window.scrollTo(0, 0)
	}
	scrollToHash() {
		navigation.scrollToHash(this.props.location.hash.replace('#', ''), 150)
	}

	componentDidUpdate(prevProps: Props) {
		if (this.props.location !== prevProps.location) {
			if (!this.props.location.hash) this.scrollToTop()
			else {
				this.scrollToHash()
			}
		}
	}

	render() {
		return this.props.children
	}
}
export default withRouter(ScrollToTop)
