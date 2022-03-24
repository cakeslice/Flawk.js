import { countries, Country } from 'countries-list'
import { Obj } from 'flawk-types'
import { sortBy as _sortBy } from 'lodash'

const sC: Obj = {}
let countryArray = []
for (const country of Object.keys(countries)) {
	// @ts-ignore
	countryArray.push({ key: country, obj: countries[country] })
}
countryArray = _sortBy(countryArray, ['obj.name'])
for (const country of countryArray) {
	sC[country.key] = {
		...country.obj,
	}
}
export const sortedCountries = sC

export const countriesSearch = (candidate: { value: string }, input: string): boolean => {
	const countriesList: Record<string, Country> = countries
	return (
		countriesList[candidate.value].name.toLowerCase().includes(input.toLowerCase()) ||
		candidate.value.toLowerCase().includes(input.toLowerCase()) ||
		('+' + countriesList[candidate.value].phone).includes(input)
	)
}
