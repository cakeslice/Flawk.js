/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Capacitor } from '@capacitor/core'
import Anchor from 'core/components/Anchor'
import CodeBlock from 'core/components/CodeBlock'
import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import TextEditor from 'core/components/TextEditor'
import config from 'core/config'
import { countriesSearch, sortedCountries } from 'core/functions/countries'
import { useSetState } from 'core/functions/hooks'
import styles from 'core/styles'
import { countries } from 'countries-list'
import Parser from 'html-react-parser'
import 'moment/locale/pt'
import React, { useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Flag from 'react-flagkit'
import Helmet from 'react-helmet'
import MediaQuery, { useMediaQuery } from 'react-responsive'
import { SizeMe } from 'react-sizeme'
import FInput from '../FInput'
import { Next, Section } from './ComponentsViewer'

//

const QueryParams = React.lazy(() => import('core/components/viewer/misc/QueryParams'))
const Localization = React.lazy(() => import('core/components/viewer/misc/Localization'))
const Web3Wallet = React.lazy(() => import('core/components/viewer/misc/Web3Wallet'))
const Unity = React.lazy(() => import('core/components/viewer/misc/Unity'))

//

// @ts-ignore
const ReactErrorTest = React.lazy(() => {
	const test = async () => {
		return <></>
	}
	return test
})

export default function Misc() {
	const [state, setState] = useSetState({
		locallyStored: '',
		newLocallyStored: '',

		reactErrorTest: false,

		toggleTitle: false,

		//

		textEditor: '',

		//

		chunkLoadError: undefined as undefined | boolean,
	})

	useEffect(() => {
		async function run() {
			let e = await global.storage.getItem('locallyStored')
			if (!e) {
				e = 'Something'
				await global.storage.setItem('locallyStored', e)
			}
			setState({ locallyStored: e, newLocallyStored: e })
		}
		run()
	}, [])

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div>
			<Section
				description={
					<>
						<m>Extend</m> your component with <code>QueryParams</code> to <m>set/get</m>{' '}
						query params easily.
						<sp />
						To set query params use <code>this.setQueryParams</code>.
						<br />
						To get query params use <code>this.queryParams</code>.
					</>
				}
				title='Query parameters'
				top
				tags={['useQueryParams', 'extends QueryParams']}
				github='client/src/core/components/viewer/misc/QueryParams.tsx'
			>
				<QueryParams />
			</Section>

			<Section
				code={`await global.storage.setItem(
	'example',
	'Hello!'
)

const stored = await global.storage.getItem('example')

alert(stored) // Hello!
`}
				description={
					<>
						Use <code>global.storage</code> to <m>get/set</m> data stored <m>locally</m>
						.
						<sp />
						Unlike <code>window.localStorage</code>, <code>global.storage</code> uses{' '}
						<code>local-storage-fallback</code> internally and it has{' '}
						<m>multiple fallbacks</m> in case local storage is not available.
						<br />
						It also has mobile app support with <m>Capacitor</m>.
					</>
				}
				title='Local storage'
				tags={['global.storage']}
			>
				<div className='flex items-end'>
					<FInput
						name='local_storage'
						isControlled
						value={state.newLocallyStored}
						onChange={(e) => {
							setState({ newLocallyStored: e as string })
						}}
						style={{
							width: 100,
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0,
						}}
					/>
					<FButton
						onClick={async () => {
							await global.storage.setItem('locallyStored', state.newLocallyStored)
							setState({
								locallyStored: state.newLocallyStored,
							})
						}}
						isDisabled={state.locallyStored === state.newLocallyStored}
						style={{
							minWidth: 40,
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
						}}
					>
						Set
					</FButton>
				</div>
			</Section>

			<Anchor id='anchor_example'></Anchor>
			<Section
				code={`import config from 'core/config'
import LanguageSelect, { changeLanguage } from 'core/components/LanguageSelect'

// Localized text

config.localize({ en: 'Example', fr: 'Exemple', es: 'Ejemplo', ch: '例子' })

/* ** src/project/text.ts **
example: { en: 'Example', fr: 'Exemple', es: 'Ejemplo', ch: '例子' }					
*/
config.text('example')


// Localized date

new Date().toLocaleDateString(global.lang.date)


// Localized number

config.formatNumber(15000)
config.formatDecimal(15000)


// Change language

changeLanguage('en')

<LanguageSelect/>
`}
				description={
					<>
						Use the <code>global.lang</code> object to check which <m>language</m> is
						currently <m>active</m>.
						<sp />
						To change the language, use the <code>{'<LanguageSelect/>'}</code> component
						or the <code>{'changeLanguage()'}</code> function.
						<sp />
						Use <code>config.localize()</code> to get a localized string from an object.
						<br />
						Use <code>config.text()</code> to get a localized string defined in{' '}
						<code>src/project/text.ts</code>.
						<sp />
						In <code>src/project/_config.ts</code> you can define the supported
						languages in the <code>supportedLanguages</code> property.
					</>
				}
				title='Localization'
				tags={['global.lang', 'config.text()', 'config.localize()', 'LanguageSelect.ts']}
				github='client/src/core/components/viewer/misc/Localization.tsx'
			>
				<Localization />
			</Section>

			<Section
				code={`import Dropdown from 'core/components/Dropdown'
import Flag from 'react-flagkit'
import { 
	countriesSearch, 
	sortedCountries 
} from 'core/functions/countries'
import { countries } from 'countries-list'

<Dropdown
	isSearchable={true}
	searchFunction={countriesSearch}
	placeholder='Search countries'
	showOnlyIfSearch
	options={Object.keys(sortedCountries).map((c) => {
		return {
			value: c,
			label: (
				<div className='flex items-center'>
					<Flag country={c} />
					<div
						style={{
							marginLeft: 10,
						}}
					>
						{
							// @ts-ignore
							countries[c].name
						}
					</div>
				</div>
			),
		}
	})}
/>
`}
				description={
					<>
						In <code>countries.ts</code> you can find <code>sortedCountries</code> to
						get a sorted list of all <m>countries</m> and also{' '}
						<code>{'countriesSearch()'}</code> function to be able to search countries
						in a <code>{'<Dropdown/>'}</code> component.
						<sp />
						To display country <m>flags</m>, use the <code>{'<Flag/>'}</code> component
						from <code>react-flagkit</code>
					</>
				}
				title='Countries'
				tags={['countries.ts', 'countries-list', 'react-flagkit']}
			>
				<Dropdown
					uncontrolled
					style={{ minWidth: 200 }}
					isSearchable={true}
					searchFunction={countriesSearch}
					placeholder='Search countries'
					showOnlyIfSearch
					options={Object.keys(sortedCountries).map((c) => {
						return {
							value: c,
							label: (
								<div className='flex items-center'>
									<Flag country={c} />
									<div
										style={{
											marginLeft: 10,
										}}
									>
										{
											// @ts-ignore
											countries[c].name +
												' (+' +
												// @ts-ignore
												countries[c].phone +
												')'
										}
									</div>
								</div>
							),
						}
					})}
				/>
			</Section>

			<Section
				code={`import config from 'core/config'
import { useMediaQuery } from 'react-responsive'
import { SizeMe } from 'react-sizeme'

function MyComponent() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<>
			<div>
				{desktop
					? 'This is a big screen'
					: 'This is a small screen'}
			</div>			

			<SizeMe>
				{({ size }) => (
					<div>
						{'This container is ' + size.width + ' pixels wide'}
					</div>
				)}
			</SizeMe>
		</>
	)
}
`}
				description={
					<>
						Components in Flawk use <code>{'<MediaQuery/>'}</code> from{' '}
						<code>react-responsive</code> to swith between mobile and desktop versions
						of components.
						<sp />
						In <code>src/project/_config.ts</code> you can use the{' '}
						<code>mobileWidthTrigger</code> property to set the screen size that
						triggers the mobile version of components.
						<sp />
						To get the size of a container, use the <code>{'<SizeMe/>'}</code> component
						from <code>react-sizeme</code>.
					</>
				}
				title='Media query'
				tags={['react-responsive', 'react-sizeme']}
			>
				<MediaQuery minWidth={config.mobileWidthTrigger}>
					{(desktop) => (
						<div>{desktop ? 'This is a big screen' : 'This is a small screen'}</div>
					)}
				</MediaQuery>
				<sp />
				<div style={{ ...styles.card, padding: 0 }}>
					<SizeMe>
						{({ size }) => (
							<div style={{ padding: 10 }}>
								{'This container is ' +
									(size.width ? size.width.toFixed(0) : '?') +
									' pixels wide'}
							</div>
						)}
					</SizeMe>
				</div>
			</Section>

			<Section
				code={
					// eslint-disable-next-line
					`import Anchor from 'core/components/Anchor'

<Anchor id='anchor_example'></Anchor>

<a href='#anchor_example'>Scroll to Anchor</a>
`
				}
				description={
					<>
						Use the <code>{'<Anchor/>'}</code> component to be able to reference a
						section of your page using <m>hash links</m>.
						<sp />
						You can also update the hash of the current page <m>automatically</m> when
						the children of the anchor are in <m>view</m> using the{' '}
						<code>updateHash</code> prop.
					</>
				}
				title='Anchor'
				tags={['<Anchor/>']}
			>
				<FButton href='#anchor_example'>Scroll to Localization</FButton>
			</Section>

			<Section
				code={`import Helmet from 'react-helmet'

<Helmet>
	<title>Hello World!</title>
</Helmet>
`}
				description={
					<>
						With the <code>{'<Helmet/>'}</code> component from <code>react-helmet</code>
						, you can add or modify tags in the document <code>{'<head/>'}</code>.
						<sp />
						Internally, Flawk uses this component to set the{' '}
						<m>title and description</m> using the strings defined in{' '}
						<code>src/project/_config</code>.
						<br />
						You can modify them by changing the <code>title</code>, <code>phrase</code>,{' '}
						<code>separator</code> and <code>description</code> properties.
					</>
				}
				title='<head/>'
				tags={['react-helmet']}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FButton
						onClick={() => {
							setState({ toggleTitle: !state.toggleTitle })
						}}
					>
						Change Page Title
					</FButton>
					{state.toggleTitle && (
						<Helmet>
							<title>Hello World!</title>
						</Helmet>
					)}
				</div>
			</Section>

			<Section
				description={
					<>
						Flawk uses{' '}
						<a target='_blank' href='https://sentry.io' rel='noreferrer'>
							Sentry
						</a>{' '}
						for error tracking.
						<br />
						Use the env var <code>VITE_SENTRY_KEY</code> to set your <m>Sentry</m> API
						key.
						<sp />
						If {"there's"} a critical <m>application error</m>, Flawk displays an error
						page with a message and a button to refresh the page.
						<br />
						The error message can be changed in <code>src/project/text.ts</code> by
						modifying the properties <code>reactError</code> and{' '}
						<code>reactErrorTry</code>.
					</>
				}
				title='Error Handling'
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					{state.reactErrorTest && <ReactErrorTest />}
					<FButton
						onClick={() => {
							// @ts-ignore
							global.something.that.does.not.exist.and.will.throw.an.error()
						}}
					>
						Javascript Error
					</FButton>
					<FButton
						onClick={() => {
							setState({ chunkLoadError: true })
						}}
					>
						React Error
					</FButton>
					<FButton
						onClick={() => {
							console.error('Error log test')
						}}
					>
						Log Error
					</FButton>
				</div>
			</Section>

			<Section
				code={`import config from 'core/config'

config.scrollToTop()
`}
				description={
					<>
						Use <code>{'config.scrollToTop()'}</code> to scroll to the top of the
						<m>page</m>.
					</>
				}
				title='Scroll to top'
				tags={['config.scrollToTop()']}
			>
				<FButton onClick={() => config.scrollToTop()}>Scroll</FButton>
			</Section>

			<Section
				code={`import { CopyToClipboard } from 'react-copy-to-clipboard'

<CopyToClipboard
	text={'https://awesome-website.com'}
	onCopy={() =>
		global.addFlag('Copied!', '', 'default', { autoClose: true })
	}
>
	<button type='button'>Copy Link</button>
</CopyToClipboard>
`}
				description={
					<>
						Use the <code>{'<CopyToClipboard/>'}</code> component from{' '}
						<code>react-copy-to-clipboard</code> to copy text to the <m>clipboard</m>.
					</>
				}
				title='Copy to clipboard'
				tags={['react-copy-to-clipboard']}
			>
				<CopyToClipboard
					text={'https://github.com/cakeslice'}
					onCopy={() => global.addFlag('Copied!', '', 'default', { autoClose: true })}
				>
					<FButton>Copy Link</FButton>
				</CopyToClipboard>
			</Section>

			{!Capacitor.isNativePlatform() && (
				<Section
					description={
						<>
							To release your web app as an Android or iOS app, you can use{' '}
							<a href='https://capacitorjs.com/' target='_blank' rel='noreferrer'>
								Capacitor
							</a>
							.
							<sp />
							To change the <m>Capacitor</m> configuration, modify{' '}
							<code>capacitor.config.json</code>.
							<br />
							To generate mobile <m>app icons</m>, use the npm script{' '}
							<code>generate_mobile_icons</code>.
							<sp />
							To generate the <m>executable</m>, use the npm script{' '}
							<code>build_android</code> for Android, and <code>build_ios</code> for
							iOS.
						</>
					}
					title='Mobile app'
					tags={['Capacitor']}
				>
					<a
						// eslint-disable-next-line
						href='https://play.google.com/store/apps/details?id=io.flawk.mobile&utm_source=flawk&utm_campaign=components_viewer&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
						target='_blank'
						rel='noreferrer'
					>
						<img
							style={{ width: 119, margin: -7.5 }}
							alt='Get it on Google Play'
							src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
						/>
					</a>
				</Section>
			)}

			{!Capacitor.isNativePlatform() && desktop && (
				<Section
					description={
						<>
							This component uses <code>ethers</code> and <code>web3modal</code>{' '}
							internally.
						</>
					}
					title='Web3 wallet'
					tags={['web3wallet.ts']}
					github='client/src/core/components/viewer/misc/Web3Wallet.tsx'
				>
					<Web3Wallet />
				</Section>
			)}

			{!Capacitor.isNativePlatform() && (
				<Section
					code={`import Unity from 'core/components/Unity'

unityEvents = [
	{
		name: 'GameOver',
		callback: () => {
			alert('GameOver')
		},
	},
]

<div>
	<button type='button'
		onClick={() => {
			global.sendUnityEvent?.('YourGameObject', 'Method')
		}}
	>
		Change Color
	</button>
	<sp/>
	<Unity
		fullscreen={false}
		extension={'.unityweb'}
		events={this.unityEvents}
		buildPath={'/unity/Build'}
	/>
</div>
`}
					description={
						<>
							This component uses <code>react-unity-webgl</code> internally.
							<sp />
							<div className='flex items-center'>
								<tag
									style={{
										color: styles.colors.red,
										opacity: 1,
										background: config.replaceAlpha(styles.colors.red, 0.15),
										marginRight: 10,
									}}
								>
									NOTE
								</tag>
								<div>{"Unity won't work on iOS until Apple releases a fix"}</div>
							</div>
						</>
					}
					title='Unity'
					tags={['<Unity/>']}
					github='client/src/core/components/viewer/misc/Unity.tsx'
				>
					<Unity />
				</Section>
			)}

			<Section
				code={`import config from 'core/config'

config.injectScript(
	\`const hello = function (){alert('Hello!')};hello();\`,
	'text',
	false,
	true
)
`}
				description={
					<>
						Component used for code syntax highlighting.
						<sp />
						By default <code>prettier</code> is used to format the code but can be
						disabled with the <code>noPrettier</code> prop.
						<sp />
						This component uses <code>react-syntax-highlighter</code> internally.
					</>
				}
				title='Inject script'
				tags={['config.injectScript()']}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FButton
						onClick={() => {
							config.injectScript(
								`const hello = function (){alert('Hello!')};hello();`,
								'text',
								false,
								true
							)
						}}
					>
						Inject
					</FButton>
				</div>
			</Section>

			<Section
				code={`import CodeBlock from 'core/components/CodeBlock'

<CodeBlock
	lang='json'
	data={JSON.stringify({
		hello: 'world',
		foo: 'bar',
	})}
/>
`}
				description={
					<>
						Component used for code syntax highlighting.
						<sp />
						By default <code>prettier</code> is used to format the code but can be
						disabled with the <code>noPrettier</code> prop.
						<sp />
						This component uses <code>react-syntax-highlighter</code> internally.
					</>
				}
				title='Code block'
				tags={['<CodeBlock/>']}
			>
				<CodeBlock
					style={{ maxWidth: 400 }}
					lang='json'
					data={JSON.stringify(
						{
							hello: 'world',
							foo: 'bar',
						},
						null,
						3
					)}
				/>
			</Section>

			{desktop && (
				<Section
					code={`import { useSetState } from 'core/functions/hooks'
import TextEditor from 'core/components/TextEditor'

function MyComponent() {
	const [state, setState] = useSetState({
		textEditor: '',
	})

	return (
		<TextEditor
			value={state.textEditor}

			onChange={(e) => {
				// Mutate directly while editing for performance
				state.textEditor = e

				// For <Formik/> use setFieldValue
			}}

			onBlur={() => {
				setState({ textEditor: state.textEditor })
			}}
		/>
	)
}
`}
					description={
						<>
							This component uses <code>react-quill</code> internally.
							<sp />
							<div className='flex items-center'>
								<tag
									style={{
										color: styles.colors.red,
										opacity: 1,
										background: config.replaceAlpha(styles.colors.red, 0.15),
										marginRight: 10,
									}}
								>
									NOTE
								</tag>
								<div>
									{"This component doesn't work properly on Android due to "}
									<a
										target='_blank'
										href='https://github.com/quilljs/quill/issues/3240'
										rel='noreferrer'
									>
										this issue
									</a>
								</div>
							</div>
						</>
					}
					title='Text editor'
					tags={['<TextEditor/>']}
				>
					<div style={{ maxWidth: 710 }}>
						<TextEditor
							style={{
								...styles.card,
								padding: 0,
							}}
							onBlur={() => {
								setState({ textEditor: state.textEditor })
							}}
							value={state.textEditor}
							onChange={(e) => {
								// Mutate directly while editing for performance
								state.textEditor = e

								// For <Formik/> use setFieldValue
							}}
						/>
						<sp />
						<div className='ql-editor' style={{ minHeight: 0 }}>
							{state.textEditor && Parser(state.textEditor)}
						</div>
					</div>
				</Section>
			)}
			<Next backName='Inputs' backLink='inputs' name='Backend' link='backend/features' />
		</div>
	)
}
