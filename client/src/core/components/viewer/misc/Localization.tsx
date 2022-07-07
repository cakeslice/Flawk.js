/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Dropdown from 'core/components/Dropdown'
import FInput from 'core/components/FInput'
import LanguageSelect from 'core/components/LanguageSelect'
import config from 'core/config'
import styles from 'core/styles'
import { formatDistanceToNow, subDays } from 'date-fns'
import { pt } from 'date-fns/locale'

export default function Localization() {
	return (
		<>
			<LanguageSelect />
			<sp />
			<div style={styles.card}>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<div>
						{/* Needs "import 'moment/locale/LANGUAGE'" to support other locales */}
						<FInput label='Date' datePicker />
					</div>
					<div>
						<Dropdown label='Dropdown' />
					</div>
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<div>
						<tag>{config.text('common.searching')}</tag>
					</div>
					<div>
						<tag>
							{config.localize({
								pt: 'Cancelar',
								en: 'Cancel',
							})}
						</tag>
					</div>
					<div>
						<tag>{config.formatNumber(15000)}</tag>
					</div>
					<div>
						<tag>{config.formatDecimal(15000)}</tag>
					</div>
					<div>
						<tag>
							{new Date().toLocaleDateString(global.lang.date, {
								day: '2-digit',
								month: 'long',
								year: 'numeric',
							})}
						</tag>
					</div>
					<div>
						<tag>
							{formatDistanceToNow(subDays(new Date(), 1), {
								...(global.lang.moment === 'pt' && { locale: pt }),
							})}
						</tag>
					</div>
				</div>
			</div>
		</>
	)
}
