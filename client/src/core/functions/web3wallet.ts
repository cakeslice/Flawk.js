/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ethers } from 'ethers'
import Web3Modal, { IProviderOptions, ThemeColors } from 'web3modal'

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
const truncateEthAddress = (address: string) => {
	const match = address.match(truncateRegex)
	if (!match) return address
	return `${match[1]}…${match[2]}`
}

export type Options = {
	targetChain: number
	callbacks: {
		accountsChanged?: (accounts: string[]) => void
		chainChanged?: (chainId: number) => void
		disconnected?: (error: { code: number; message: string }) => void
		connected?: (info: { chainId: number }) => void
	}
	providerOptions?: IProviderOptions
	theme?: 'dark' | 'light' | ThemeColors
	showErrors?: boolean
}
const defaultProvider: IProviderOptions = {
	injected: {
		display: {
			name: 'Metamask',
			description: 'Connect with the provider in your Browser',
		},
		package: null,
	},
	/*
	walletconnect: {
		package: WalletConnectProvider,
		options: {
			bridge: 'https://bridge.walletconnect.org',
			infuraId: 'XXX',
		},
	},
	walletlink: {
		package: WalletLink, // Required
		options: {
			appName: 'yourapp.io', // Required
			infuraId: 'XXX', // Required unless you provide a JSON RPC url; see `rpc` below
			darkMode: global.nightMode
		},
	},
	*/
}

let web3Modal: Web3Modal | undefined
export type Wallet = {
	balance: string
	address: string
	provider: ethers.providers.Web3Provider
}

export const clearWallet = () => {
	global.localStorage.setItem('wallet_connected', 'false')
}
export const setupWallet = async (options: Options) => {
	if (global.localStorage.getItem('wallet_connected') === 'true') {
		return await connectWallet(options)
	}
	return undefined
}
export const connectWallet = async (options: Options) => {
	try {
		if (!web3Modal)
			web3Modal = new Web3Modal({
				network: 'mainnet',
				cacheProvider: false,
				providerOptions: options.providerOptions || defaultProvider,
				theme: options.theme || (global.nightMode ? 'dark' : 'light'),
			})

		const instance = (await web3Modal.connect()) as ethers.providers.ExternalProvider
		const provider = new ethers.providers.Web3Provider(instance)
		const address = await provider.getSigner().getAddress()
		const balance = await provider.getBalance(address)

		// Check target chain
		// @ts-ignore
		if (instance?.chainId !== '0x' + options.targetChain) {
			if (options.showErrors !== false)
				global.addFlag('Please switch to Ethereum Mainnet', undefined, 'error', {
					autoClose: true,
				})
			clearWallet()
			return undefined
		}

		// Wallet events
		const prefix = '[Web3] '
		const { provider: ethereum } = provider
		// @ts-ignore
		ethereum.on('accountsChanged', (accounts: string[]) => {
			console.log(prefix + 'accountsChanged: ' + accounts)
			options.callbacks.accountsChanged?.(accounts)
		})
		// @ts-ignore
		ethereum.on('chainChanged', (chainId: number) => {
			console.log(prefix + 'chainChanged: ' + chainId)
			clearWallet()
			options.callbacks.chainChanged?.(chainId)
		})
		// @ts-ignore
		ethereum.on('connect', (info: { chainId: number }) => {
			console.log(prefix + 'connected: ' + info)
			options.callbacks.connected?.(info)
		})
		// @ts-ignore
		ethereum.on('disconnect', (error: { code: number; message: string }) => {
			console.log(prefix + 'disconnected: ' + error)
			clearWallet()
			options.callbacks.disconnected?.(error)
		})

		global.localStorage.setItem('wallet_connected', 'true')
		return {
			address: truncateEthAddress(address),
			balance: Number(ethers.utils.formatEther(balance)).toFixed(2),
			provider,
		}
	} catch (error) {
		if (options.showErrors !== false)
			global.addFlag(
				(error as Error).message || "Couldn't connect wallet",
				undefined,
				'error',
				{
					autoClose: true,
				}
			)
		clearWallet()
		return undefined
	}
}
