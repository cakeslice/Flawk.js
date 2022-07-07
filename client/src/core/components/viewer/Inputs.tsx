/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Next, Section } from './ComponentsViewer'

// Can't use React.lazy() for anchor links to work

import FDropdown from 'core/components/viewer/inputs/Dropdown'
import Form from 'core/components/viewer/inputs/Form'
import Input from 'core/components/viewer/inputs/Input'
import Slider from 'core/components/viewer/inputs/Slider'

export default function Inputs() {
	return (
		<div>
			<Section
				description={
					<>
						Use <code>appearance</code> prop to set the <m>input style</m>. You can
						override or add new input styles in <code>src/project/_styles.ts</code>{' '}
						using the <code>inputAppearances</code> property.
						<br />
						You can also use <code>glamor</code> overrides like <code>{':hover'}</code>{' '}
						to customize the style in <m>different states</m>.
						<sp />
						To make it a <m>controlled</m> input, use <code>isControlled</code> prop and
						supply a value to <code>value</code> prop.
						<sp />
						Use with <code>{'<Field/>'}</code> if inside a <a href='#form'>form</a>.
					</>
				}
				code={`import FInput from 'core/components/FInput'

// E-mail
<FInput
	type='email'
	label='E-mail'
	autoComplete='new-email'
	placeholder='you@gmail.com'
	onChange={(e) => {
		console.log('E-mail value: ' + e)
	}}
/>

// Text area
<FInput
	style={{ width: '100%', minHeight: 50 }}
	label='Text Area'
	textArea
></FInput>

// Date
<FInput
	label='Date'
	datePicker
/>
`}
				title='Input field'
				tags={['<FInput/>', '<input>']}
				top
				github='client/src/core/components/viewer/inputs/Input.tsx'
			>
				<Input />
			</Section>

			<Section
				description={
					<>
						Use <code>appearance</code> prop to set the <m>input style</m>. You can
						override or add new input styles in <code>src/project/_styles.ts</code>{' '}
						using the <code>inputAppearances</code> property.
						<br />
						You can also use <code>glamor</code> overrides like <code>{':hover'}</code>{' '}
						to customize the style in <m>different states</m>.
						<sp />
						The <code>options</code> prop is an array of objects with a <m>label</m> and
						a <m>value</m>.
						<br />
						To load options asynchronously, use <code>loadOptions</code> prop.
						<br />
						Use <code>isSearchable</code> prop to make the dropdown <m>options</m>{' '}
						searchable.
						<sp />
						Use with <code>{'<Field/>'}</code> if inside a <a href='#form'>form</a>.
						<sp />
						This component uses <code>react-select</code> internally.
					</>
				}
				code={`import Dropdown from 'core/components/Dropdown'

<Dropdown
	isSearchable
	label='Dropdown'
	onChange={(e) => {
		console.log('Dropdown value: ' + e)
		// The 'value' of chosen option
	}}
	options={[
		{
			label: 'Option 1',
			value: 'option_1'
		},
		{
			label: 'Option 2',
			value: 'option_2'
		}
	]}
/>
`}
				title='Dropdown'
				tags={['<Dropdown/>']}
				github='client/src/core/components/viewer/inputs/Dropdown.tsx'
			>
				<FDropdown />
			</Section>

			<Section
				description={
					<>
						To build a <m>form</m> in Flawk, use the <code>formik</code> library and the{' '}
						<code>{'<Field/>'}</code> component.
						<sp />
						Use <code>component</code> prop in <code>{'<Field/>'}</code> to choose the
						component that you want to use.
						<br />
						<code>{'<Field/>'}</code> supports the following Flawk components:
						<ul>
							<li>
								<code>{'<FInput/>'}</code>
							</li>
							<li>
								<code>{'<FButton/>'}</code>
							</li>
							<li>
								<code>{'<Dropdown/>'}</code>
							</li>
						</ul>
						<sp />
						Refer to the <code>formik</code>{' '}
						<a href='https://formik.org/docs/overview' target='_blank' rel='noreferrer'>
							documentation
						</a>{' '}
						for more information.
					</>
				}
				title='Form'
				tags={['<Formik/>', '<Form/>', '<Field/>']}
				github='client/src/core/components/viewer/inputs/Form.tsx'
			>
				<Form />
			</Section>

			<Section
				description={
					<>
						Use <code>range</code> prop to choose between a <m>single value</m> slider
						or a <m>range slider</m> between two values.
						<sp />
						This component uses <code>rc-slider</code> internally.
					</>
				}
				title='Slider'
				tags={['<Slider/>']}
				github='client/src/core/components/viewer/inputs/Slider.tsx'
			>
				<Slider />
			</Section>

			<Next backName='Layout' backLink='layout' name='Misc' link='misc' />
		</div>
	)
}
