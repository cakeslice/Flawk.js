/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import {
	connectWallet as _connectWallet,
	Options,
	setupWallet,
	Wallet,
} from 'core/functions/web3wallet'
import { useEffect, useState } from 'react'

export default function Web3Wallet() {
	const [wallet, setWallet] = useState<Wallet>()

	const connectWallet = async () => {
		const wallet = await _connectWallet(walletOptions)
		setWallet(wallet)
	}
	const walletOptions: Options = {
		targetChain: 1,
		callbacks: {
			accountsChanged: connectWallet,
			chainChanged: connectWallet,
			disconnected: async () => {
				setWallet(undefined)
			},
		},
	}

	useEffect(() => {
		async function run() {
			const wallet = await setupWallet(walletOptions)
			setWallet(wallet)
		}
		run()
	}, [])

	return (
		<>
			<FButton onClick={connectWallet}>Connect Wallet</FButton>
			{wallet && (
				<>
					<sp />
					<div>
						Wallet connected: <m>{wallet.address}</m>
					</div>
				</>
			)}
		</>
	)
}
