import React from 'react'

export const closeIcon = (color: string) => (
	<svg height='12' width='12' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M8 6.585l4.593-4.592a1 1 0 0 1 1.415 1.416L9.417 8l4.591 4.591a1 1 0 0 1-1.415 1.416L8 9.415l-4.592 4.592a1 1 0 0 1-1.416-1.416L6.584 8l-4.59-4.591a1 1 0 1 1 1.415-1.416z'
			fillRule='evenodd'
			fill={color}
		></path>
	</svg>
)
