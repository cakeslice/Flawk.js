/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//import * as serviceWorkerRegistration from 'core/internal/serviceWorkerRegistration'
import App from 'project/App'
import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(<App></App>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.unregister()
