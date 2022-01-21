/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const replace = require('replace-in-file')

let options = {
	files: './app/project/database.gen.ts',
	from: /select: {}/g,
	to: '',
}

// Remove select properties
try {
	console.log('Replacement results:', replace.sync(options))
} catch (error) {
	console.error('Error occurred:', error)
}
