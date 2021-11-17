/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import React from 'react'
import { MetroSpinner } from 'react-spinners-kit'

export default function Loading(props: { large?: boolean; small?: boolean }) {
	return (
		<MetroSpinner
			size={
				props.large
					? styles.spinnerLarge.size
					: props.small
					? styles.spinnerSmall.size
					: styles.spinnerMedium.size
			}
			color={config.replaceAlpha(styles.colors.black, 0.2)}
			loading={true}
		/>
	)
}
