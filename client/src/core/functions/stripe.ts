/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripe: Stripe | null
const initStripe = async () => {
	if (import.meta.env.VITE_STRIPE_KEY) {
		if (!stripe) stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY as string)
	} else console.error('Stripe error: No Stripe key provided!')
}
export const redirectToCheckout = async (sessionId: string) => {
	if (!stripe) await initStripe()

	if (stripe)
		await stripe.redirectToCheckout({
			sessionId: sessionId,
		})
	else console.error('Stripe error: Stripe failed to initialize!')
}
