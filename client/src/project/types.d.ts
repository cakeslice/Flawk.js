/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'project-types' {
	type UserState = import('project/redux/AppReducer').UserState
	type DashboardWrapperProps = import('core/components/Dashboard').DashboardWrapperProps

	export type ReduxProps = {
		structures?: KeyArrayKeyObject
		fetchingStructures: boolean
		user?: UserState
		fetchingUser: boolean
		fetchUser: () => Promise<void>
		fetchStructures: () => Promise<void>
	}
	export type DashboardProps = DashboardWrapperProps &
		ReduxProps & {
			//
			superAdmin?: boolean
		}
}
