/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'

import Router from './Router'
import AppBase from 'core/components/AppBase'

import { Provider } from 'react-redux'
import store from './redux/_store.js'

/**
 * @param props
 */
export default function App(props) {
	return (
		<Provider store={store}>
			<div>
				<AppBase component={Router}></AppBase>
			</div>
		</Provider>
	)
}
