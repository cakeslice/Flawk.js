import db from 'core/functions/db'
import { Client } from 'project/database'

export const onStripeSubscriptionActive = async (stripeCustomer: string) => {
	const user = await Client.findOne({ 'core.stripeCustomer': stripeCustomer }).select(
		'_id permission flags'
	)

	if (user) {
		if (user.permission > 100) user.permission = 100

		if (!user.flags) db.replaceArray(user.flags, ['verified'])
		else if (!user.flags.includes('verified')) user.flags.push('verified')

		await user.save()
		return true
	} else return false
}
