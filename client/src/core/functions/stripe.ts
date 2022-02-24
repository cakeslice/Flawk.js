/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripe: Stripe | null
export const initStripe = async () => {
	if (process.env.REACT_APP_STRIPE_KEY) {
		if (!stripe) stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY)
	} else console.error('Stripe error: No Stripe key provided!')
}
export const redirectToCheckout = (sessionId: string) => {
	if (stripe)
		stripe.redirectToCheckout({
			sessionId: sessionId,
		})
	else console.error('Stripe error: Stripe is not initialized!')
}