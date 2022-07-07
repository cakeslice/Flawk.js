/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router-dom'

export default function Typography() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div style={{ ...styles.card }}>
			<h1>
				{'Hello. '}
				<tag>h1</tag>
			</h1>
			<hr />
			<sp />
			<h2>
				{'This a '}
				<span
					style={{
						textDecoration: 'underline',
						textDecorationColor: styles.colors.main,
					}}
				>
					title
				</span>{' '}
				<tag>h2</tag>
			</h2>
			<hr />
			<sp />
			<p>
				Lorem ipsum dolor sit amet, adipiscing elit, sed do eiusmod tempor ut labore et
				dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo{' '}
				<Link to='/components/style#button'>anchor link</Link>.
			</p>
			<sp />
			<sp />
			<sp></sp>
			<h3>
				{'Another title '}
				<span>
					<tag>h3</tag>
				</span>
			</h3>
			<hr />
			<sp />
			<h4>
				{'One more title '}
				<span>
					<tag>h4</tag>
				</span>
			</h4>
			<p>
				{
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo '
				}
				<a href='https://github.com/cakeslice' target='_blank' rel='noreferrer'>
					new tab link
				</a>
				.
			</p>
			<sp />
			<i>
				Italic ipsum <s>strikethrough</s> sit amet,{' '}
				<Tooltip tooltipProps={{ placement: 'top' }} content={<div>Hello World!</div>}>
					<b style={{ color: styles.colors.main }}>tooltip</b>
				</Tooltip>{' '}
				adipiscing elit, sed do tempor <hl>highlighted</hl> incididunt ut <u>underline</u>{' '}
				et dolore magna.
			</i>
			<sp />
			<p>
				<b>
					<bb>{'Bigger. '}</bb>
				</b>
				<small>{'Smaller.'}</small>
			</p>
			<sp />
			<sp />
			<p>
				<b>Bold</b>
				{' ipsum dolor sit amet, '}
				<m>medium</m>
				{' adipiscing elit.'}
			</p>
			<hsp />
			<p>
				{
					'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat:'
				}
			</p>
			<ul>
				<li>
					Lorem{' '}
					<tag
						style={{
							color: styles.colors.red,
							opacity: 1,
							background: config.replaceAlpha(styles.colors.red, 0.15),
							marginLeft: 10,
						}}
					>
						Tag #1
					</tag>
					<vr />
					<tag
						style={{
							color: styles.colors.green,
							opacity: 1,
							background: config.replaceAlpha(styles.colors.green, 0.15),
						}}
					>
						Tag #2
					</tag>
				</li>
				<li>Ipsum</li>
				<li>Dolor</li>
				<li>Sit</li>
			</ul>
			<sp />
			<p>
				{
					'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
				}
			</p>
			<sp />
			<hr />
			<sp />
			<blockquote>
				“Computers are incredibly fast, accurate, and stupid. Human beings are incredibly
				slow, inaccurate, and brilliant.
				<br />
				Together they are powerful beyond imagination.”
				<sp />
				<i style={{ textAlign: 'right' }}>Albert Einstein</i>
			</blockquote>
			<sp />
			<div className='flex'>
				<code>int code = 1;</code>
				<sp />
				<p>
					<kbd>Enter</kbd>
				</p>
			</div>
			<sp />
			<hr />
			<sp />
			<div
				className={
					'wrapMarginBig flex flex-wrap ' + (desktop ? 'justify-between' : 'flex-start')
				}
			>
				<div>
					<h1>
						Line
						<br />
						height
					</h1>
				</div>
				<div>
					<h2>
						Line
						<br />
						height
					</h2>
				</div>
				<div>
					<h3>
						Line
						<br />
						height
					</h3>
				</div>
				<div>
					<h4>
						Line
						<br />
						height
					</h4>
				</div>
				<div>
					<p>
						Line
						<br />
						height
					</p>
				</div>
			</div>
		</div>
	)
}
