/* tslint:disable */
/* eslint-disable */

// ######################################## THIS FILE WAS GENERATED BY MONGOOSE-TSGEN ######################################## //

// NOTE: ANY CHANGES MADE WILL BE OVERWRITTEN ON SUBSEQUENT EXECUTIONS OF MONGOOSE-TSGEN.

import mongoose from 'mongoose'
import { Client, ClientDocument } from 'project/database.gen'

/**
 * Lean version of EmailTrackDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `EmailTrackDocument.toObject()`. To avoid conflicts with model names, use the type alias `EmailTrackObject`.
 * ```
 * const emailtrackObject = emailtrack.toObject();
 * ```
 */
export type EmailTrack = {
	emailHash?: string
	timestamp?: Date
	template?: string
	subject?: string
	read?: boolean
	readTimestamp?: Date
	opened?: number
	_id: mongoose.Types.ObjectId
}

/**
 * Lean version of EmailTrackDocument (type alias of `EmailTrack`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { EmailTrack } from "../models"
 * import { EmailTrackObject } from "../interfaces/mongoose.gen.ts"
 *
 * const emailtrackObject: EmailTrackObject = emailtrack.toObject();
 * ```
 */
export type EmailTrackObject = EmailTrack

/**
 * Mongoose Query types
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const EmailTrack = mongoose.model<EmailTrackDocument, EmailTrackModel>("EmailTrack", EmailTrackSchema);
 * ```
 */
export type EmailTrackQueries = {}

export type EmailTrackMethods = {}

export type EmailTrackStatics = {}

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const EmailTrack = mongoose.model<EmailTrackDocument, EmailTrackModel>("EmailTrack", EmailTrackSchema);
 * ```
 */
export type EmailTrackModel = mongoose.Model<EmailTrackDocument, EmailTrackQueries> &
	EmailTrackStatics

/**
 * Mongoose Schema type
 *
 * Assign this type to new EmailTrack schema instances:
 * ```
 * const EmailTrackSchema: EmailTrackSchema = new mongoose.Schema({ ... })
 * ```
 */
export type EmailTrackSchema = mongoose.Schema<EmailTrackDocument, EmailTrackModel>

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const EmailTrack = mongoose.model<EmailTrackDocument, EmailTrackModel>("EmailTrack", EmailTrackSchema);
 * ```
 */
export type EmailTrackDocument = mongoose.Document<mongoose.Types.ObjectId, EmailTrackQueries> &
	EmailTrackMethods & {
		emailHash?: string
		timestamp?: Date
		template?: string
		subject?: string
		read?: boolean
		readTimestamp?: Date
		opened?: number
		_id: mongoose.Types.ObjectId
	}

/**
 * Lean version of AppStateDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `AppStateDocument.toObject()`. To avoid conflicts with model names, use the type alias `AppStateObject`.
 * ```
 * const appstateObject = appstate.toObject();
 * ```
 */
export type AppState = {
	lastEmailReport?: Date
	_id: mongoose.Types.ObjectId
}

/**
 * Lean version of AppStateDocument (type alias of `AppState`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { AppState } from "../models"
 * import { AppStateObject } from "../interfaces/mongoose.gen.ts"
 *
 * const appstateObject: AppStateObject = appstate.toObject();
 * ```
 */
export type AppStateObject = AppState

/**
 * Mongoose Query types
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const AppState = mongoose.model<AppStateDocument, AppStateModel>("AppState", AppStateSchema);
 * ```
 */
export type AppStateQueries = {}

export type AppStateMethods = {}

export type AppStateStatics = {}

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const AppState = mongoose.model<AppStateDocument, AppStateModel>("AppState", AppStateSchema);
 * ```
 */
export type AppStateModel = mongoose.Model<AppStateDocument, AppStateQueries> & AppStateStatics

/**
 * Mongoose Schema type
 *
 * Assign this type to new AppState schema instances:
 * ```
 * const AppStateSchema: AppStateSchema = new mongoose.Schema({ ... })
 * ```
 */
export type AppStateSchema = mongoose.Schema<AppStateDocument, AppStateModel>

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const AppState = mongoose.model<AppStateDocument, AppStateModel>("AppState", AppStateSchema);
 * ```
 */
export type AppStateDocument = mongoose.Document<mongoose.Types.ObjectId, AppStateQueries> &
	AppStateMethods & {
		lastEmailReport?: Date
		_id: mongoose.Types.ObjectId
	}

/**
 * Lean version of WebPushSubscriptionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `WebPushSubscriptionDocument.toObject()`. To avoid conflicts with model names, use the type alias `WebPushSubscriptionObject`.
 * ```
 * const webpushsubscriptionObject = webpushsubscription.toObject();
 * ```
 */
export type WebPushSubscription = {
	endpoint: string
	keys: {
		p256dh: string
		auth: string
	}
	client?: Client['_id'] | Client
	_id: mongoose.Types.ObjectId
}

/**
 * Lean version of WebPushSubscriptionDocument (type alias of `WebPushSubscription`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { WebPushSubscription } from "../models"
 * import { WebPushSubscriptionObject } from "../interfaces/mongoose.gen.ts"
 *
 * const webpushsubscriptionObject: WebPushSubscriptionObject = webpushsubscription.toObject();
 * ```
 */
export type WebPushSubscriptionObject = WebPushSubscription

/**
 * Mongoose Query types
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const WebPushSubscription = mongoose.model<WebPushSubscriptionDocument, WebPushSubscriptionModel>("WebPushSubscription", WebPushSubscriptionSchema);
 * ```
 */
export type WebPushSubscriptionQueries = {}

export type WebPushSubscriptionMethods = {}

export type WebPushSubscriptionStatics = {}

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const WebPushSubscription = mongoose.model<WebPushSubscriptionDocument, WebPushSubscriptionModel>("WebPushSubscription", WebPushSubscriptionSchema);
 * ```
 */
export type WebPushSubscriptionModel = mongoose.Model<
	WebPushSubscriptionDocument,
	WebPushSubscriptionQueries
> &
	WebPushSubscriptionStatics

/**
 * Mongoose Schema type
 *
 * Assign this type to new WebPushSubscription schema instances:
 * ```
 * const WebPushSubscriptionSchema: WebPushSubscriptionSchema = new mongoose.Schema({ ... })
 * ```
 */
export type WebPushSubscriptionSchema = mongoose.Schema<
	WebPushSubscriptionDocument,
	WebPushSubscriptionModel
>

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const WebPushSubscription = mongoose.model<WebPushSubscriptionDocument, WebPushSubscriptionModel>("WebPushSubscription", WebPushSubscriptionSchema);
 * ```
 */
export type WebPushSubscriptionDocument = mongoose.Document<
	mongoose.Types.ObjectId,
	WebPushSubscriptionQueries
> &
	WebPushSubscriptionMethods & {
		endpoint: string
		keys: {
			p256dh: string
			auth: string
		}
		client?: ClientDocument['_id'] | ClientDocument
		_id: mongoose.Types.ObjectId
	}

/**
 * Check if a property on a document is populated:
 * ```
 * import { IsPopulated } from "../interfaces/mongoose.gen.ts"
 *
 * if (IsPopulated<UserDocument["bestFriend"]>) { ... }
 * ```
 */
export function IsPopulated<T>(doc: T | mongoose.Types.ObjectId): doc is T {
	return doc instanceof mongoose.Document
}

/**
 * Helper type used by `PopulatedDocument`. Returns the parent property of a string
 * representing a nested property (i.e. `friend.user` -> `friend`)
 */
type ParentProperty<T> = T extends `${infer P}.${string}` ? P : never

/**
 * Helper type used by `PopulatedDocument`. Returns the child property of a string
 * representing a nested property (i.e. `friend.user` -> `user`).
 */
type ChildProperty<T> = T extends `${string}.${infer C}` ? C : never

/**
 * Helper type used by `PopulatedDocument`. Removes the `ObjectId` from the general union type generated
 * for ref documents (i.e. `mongoose.Types.ObjectId | UserDocument` -> `UserDocument`)
 */
type PopulatedProperty<Root, T extends keyof Root> = Omit<Root, T> & {
	[ref in T]: Root[T] extends mongoose.Types.Array<infer U>
		? mongoose.Types.Array<Exclude<U, mongoose.Types.ObjectId>>
		: Exclude<Root[T], mongoose.Types.ObjectId>
}

/**
 * Populate properties on a document type:
 * ```
 * import { PopulatedDocument } from "../interfaces/mongoose.gen.ts"
 *
 * function example(user: PopulatedDocument<UserDocument, "bestFriend">) {
 *   console.log(user.bestFriend._id) // typescript knows this is populated
 * }
 * ```
 */
export type PopulatedDocument<DocType, T> = T extends keyof DocType
	? PopulatedProperty<DocType, T>
	: ParentProperty<T> extends keyof DocType
	? Omit<DocType, ParentProperty<T>> & {
			[ref in ParentProperty<T>]: DocType[ParentProperty<T>] extends mongoose.Types.Array<
				infer U
			>
				? mongoose.Types.Array<
						ChildProperty<T> extends keyof U
							? PopulatedProperty<U, ChildProperty<T>>
							: PopulatedDocument<U, ChildProperty<T>>
				  >
				: ChildProperty<T> extends keyof DocType[ParentProperty<T>]
				? PopulatedProperty<DocType[ParentProperty<T>], ChildProperty<T>>
				: PopulatedDocument<DocType[ParentProperty<T>], ChildProperty<T>>
	  }
	: DocType