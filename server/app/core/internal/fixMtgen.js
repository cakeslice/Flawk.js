/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const replace = require('replace-in-file')

// Remove select properties
let options = {
	files: ['./app/project/database.gen.ts', './app/core/database.gen.ts'],
	from: /select: {}/g,
	to: '',
}
try {
	console.log('"select" Replacement results:', replace.sync(options))
} catch (error) {
	console.error('Error occurred:', error)
}

// Add Client import to core/database.gen.ts
options = {
	files: ['./app/core/database.gen.ts'],
	from: /import mongoose from 'mongoose'/g,
	to: "import mongoose from 'mongoose'\nimport { Client, ClientDocument } from 'project/database.gen'",
}
try {
	console.log('"import mongoose" Replacement results:', replace.sync(options))
} catch (error) {
	console.error('Error occurred:', error)
}
