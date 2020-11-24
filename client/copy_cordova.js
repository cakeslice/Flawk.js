/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var fse = require('fs-extra')

var sourceDir = './build'
var destDir = '../cordova/www'
fse.copy(sourceDir, destDir, function (err) {
	if (err) throw err
})
