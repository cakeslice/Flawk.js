/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArrayKeyObject, ArrayObject, KeyObject, Obj } from 'flawk-types'
import mongoose, { Model, Schema } from 'mongoose'
// @ts-ignore
import mongooseLeanId from 'mongoose-lean-id'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

export const ObjectIdType = Schema.Types.ObjectId
export const MixedType = Schema.Types.Mixed

export type AggregationCount = {
	count: number
}[]

export type ObjectId = mongoose.Types.ObjectId
export function newObjectId() {
	return new mongoose.Types.ObjectId()
}
// eslint-disable-next-line
export async function getNextRef(model: Model<any>) {
	const c = await model
		.findOne({ reference: { $exists: true } })
		.sort('-reference')
		.select('reference')
	return c && c.reference !== undefined ? (c.reference as number) : 0
}

export type StructureConfig = {
	sendToFrontend: boolean
	cache: boolean
	sortKey: string
	schema: Model<unknown>
	path: string
	overrideJson?: boolean
	postProcess?: (array: ArrayKeyObject) => Promise<ArrayKeyObject>
}

export default {
	validateObjectID: function (id: string) {
		if (!mongoose.Types.ObjectId.isValid(id)) return false
		return true
	},
	toObjectID: function (id: string) {
		return new mongoose.Types.ObjectId(id)
	},
	attachPlugins: function (schema: Schema) {
		return (
			schema
				// eslint-disable-next-line
				.plugin(mongooseLeanId)
				.plugin(mongooseLeanVirtuals)
		)
	},
	getStructure: async (
		name: string,
		structures: StructureConfig[]
	): Promise<ArrayKeyObject | undefined> => {
		for (let g = 0; structures.length; g++) {
			const s = structures[g]
			if (s.schema.collection.name === name) {
				let structure = (await s.schema.find({}).lean().sort(s.sortKey)) as ArrayKeyObject

				if (structure && s.postProcess) {
					structure = await s.postProcess(structure)
				}
				return structure
			}
		}
		console.error('Failed to get structure: ' + name)
		return undefined
	},
	unshiftToArray: async function unshiftToArray(
		// eslint-disable-next-line
		schema: Model<any>,
		id: mongoose.Types.ObjectId,
		arrayName: string,
		sortObject: Obj,
		objectsArray: ArrayObject
	) {
		const o: { $push: KeyObject } = { $push: {} }
		o['$push'][arrayName] = {
			$each: objectsArray,
			$position: 0,
			$sort: sortObject,
		}
		await schema.updateOne(
			{
				_id: id,
			},
			o
		)
	},
	removeFromArray: async function removeFromArray(
		// eslint-disable-next-line
		schema: Model<any>,
		id: mongoose.Types.ObjectId,
		arrayName: string,
		key: string,
		keysArray: (string | mongoose.Types.ObjectId)[]
	) {
		const o: { $pull: KeyObject } = { $pull: {} }
		o['$pull'][arrayName] = {}
		o['$pull'][arrayName][key] = {
			$in: keysArray,
		}
		await schema.updateOne(
			{
				_id: id,
			},
			o
		)
	},
}
