import { countries, Country } from 'countries-list'

export const countriesSearch = (candidate: { value: string }, input: string): boolean => {
	const countriesList: Record<string, Country> = countries
	return (
		countriesList[candidate.value].name.toLowerCase().includes(input.toLowerCase()) ||
		candidate.value.toLowerCase().includes(input.toLowerCase()) ||
		('+' + countriesList[candidate.value].phone).includes(input)
	)
}
