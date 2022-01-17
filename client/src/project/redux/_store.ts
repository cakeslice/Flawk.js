/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AnyAction, configureStore, Dispatch } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import logger from 'redux-logger'
import { ThunkDispatch } from 'redux-thunk'
import app from './AppReducer'

const reducer = {
	app,
}

const store = configureStore({
	reducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(logger),
	devTools: process.env.NODE_ENV !== 'production',
})
export default store

export type StoreState = ReturnType<typeof store.getState>
export type StoreDispatch = ThunkDispatch<StoreState, null | undefined, AnyAction> &
	Dispatch<AnyAction>
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useStoreDispatch = () => useDispatch<StoreDispatch>()
export const useStoreSelector: TypedUseSelectorHook<StoreState> = useSelector
