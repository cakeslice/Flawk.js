/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'

export default function Toast() {
	return (
		<div className='wrapMargin flex flex-wrap justify-start'>
			<FButton
				onClick={() =>
					global.addFlag('Uploading file...', undefined, 'default', {
						closeAfter: 2000,
					})
				}
			>
				Default
			</FButton>

			<FButton
				onClick={() =>
					global.addFlag(
						'New message',
						(p) => (
							<div>
								<div>
									<b>Chris:</b> Have you heard about the new Tesla?
								</div>
								<sp />
								<div className='flex justify-end'>
									<FButton onClick={p.closeToast}>Reply</FButton>
								</div>
							</div>
						),
						'info',
						{
							playSound: true,
						}
					)
				}
			>
				Info
			</FButton>

			<FButton
				onClick={() =>
					global.addFlag('Your changes were saved', undefined, 'success', {
						closeAfter: 2000,
					})
				}
			>
				Success
			</FButton>

			<FButton
				onClick={() =>
					global.addFlag(
						'Warning',
						'There is out-of-sync data you need to review to continue',
						'warning',
						{
							closeAfter: 5000,
						}
					)
				}
			>
				Warning
			</FButton>

			<FButton onClick={() => global.addFlag('Error', 'File upload failed', 'error', {})}>
				Error
			</FButton>
		</div>
	)
}
