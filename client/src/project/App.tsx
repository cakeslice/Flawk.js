/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AppBase from 'core/components/AppBase'
import React from 'react'
import { Provider } from 'react-redux'
import store from './redux/_store'
import Router from './Router'

export default function App() {
	return (
		<Provider store={store}>
			<AppBase component={Router}></AppBase>
		</Provider>
	)
}
