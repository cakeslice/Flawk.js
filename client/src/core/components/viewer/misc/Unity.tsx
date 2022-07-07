/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import Unity from 'core/components/Unity'
import { useSetState } from 'core/functions/hooks'
import styles from 'core/styles'

export default function _Unity() {
	const [state, setState] = useSetState({
		unityReady: false,
		unityFullscreen: false,
		unityProgress: undefined as number | undefined,
	})

	const unityEvents = [
		{
			name: 'GameOver',
			callback: () => {
				alert('GameOver')
			},
		},
	]

	return (
		<>
			<div className='wrapMargin flex flex-wrap justify-start'>
				<FButton
					onClick={() => {
						global.sendUnityEvent?.('Neo', 'ChangeColor')
					}}
				>
					Change Color
				</FButton>
				<FButton
					onClick={() => {
						setState({
							unityFullscreen: !state.unityFullscreen,
						})
					}}
				>
					Fullscreen
				</FButton>
			</div>
			<hsp />
			<div
				className='flex justify-center items-center'
				style={{
					...styles.card,
					padding: 0,
					overflow: 'hidden',
					borderRadius: 10,
					width: '100%',
					maxWidth: 400,
					height: 400,
				}}
			>
				<Unity
					fullscreen={state.unityFullscreen}
					backgroundColor={styles.colors.white}
					extension={'.unityweb'}
					events={unityEvents}
					onReady={() => {
						setState({ unityReady: true })
					}}
					onLoadingProgress={(progress) => {
						setState({ unityProgress: progress })
					}}
					buildPath={'/unity/Build'}
				/>
			</div>
		</>
	)
}
