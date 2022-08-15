/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TrackedComponent from 'core/components/TrackedComponent'
import navigation from 'core/functions/navigation'
import { RouteComponentProps, withRouter } from 'react-router-dom'

type Props = {
	location: Location
} & RouteComponentProps
class ScrollToTop extends TrackedComponent<Props> {
	trackedName = 'ScrollToTop'
	shouldComponentUpdate(nextProps: Props, nextState: typeof this.state) {
		super.shouldComponentUpdate(nextProps, nextState, false)
		return this.deepEqualityCheck(nextProps, nextState)
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
