/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import QueryString from 'core/utils/queryString'

const inRestrictedEndpoint = () => {
	if (!global.routerHistory) return false

	const h = global.routerHistory()
	let inRestrictedEndpoint = false
	config.restrictedRoutes.forEach((r) => {
		if (h && h.location.pathname.includes(r) && !h.location.pathname.includes('from=' + r))
			inRestrictedEndpoint = true
	})
	return inRestrictedEndpoint
}

export default {
	inRestrictedEndpoint: inRestrictedEndpoint,
	invalidTokenRedirect: () => {
		const h = global.routerHistory()
		if (inRestrictedEndpoint()) {
			h.replace(config.noTokenRedirect + '?from=' + h.location.pathname)
		}
	},
	loginRedirect: () => {
		if (inRestrictedEndpoint()) return

		const query = QueryString.parse(window.location.search) as { from?: string }
		global.routerHistory().replace(query.from || config.loginRedirect)
	},
	resetCapacitorHistory() {
		window.history.go(-(window.history.length - 1))
	},
}
