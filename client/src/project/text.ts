/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default {
	invalid: {
		email: { pt: 'Email inválido', en: 'Invalid email' },
		password: { pt: 'Min. 6 caracteres', en: 'Min. 6 characters' },
		date: { pt: 'Data inválida', en: 'Invalid date' },
	},

	common: {
		results: { pt: 'Resultados', en: 'Results' },
		searching: { pt: 'A procurar...', en: 'Searching...' },
		cancel: { pt: 'Cancelar', en: 'Cancel' },
		delete: { pt: 'Apagar', en: 'Delete' },
		remove: { pt: 'Remover', en: 'Remove' },
		next: { pt: 'Seguinte', en: 'Next' },
		select: { pt: 'Selecionar', en: 'Select' },
		previous: { pt: 'Voltar', en: 'Previous' },
		finish: { pt: 'Concluir', en: 'Finish' },
		create: { pt: 'Criar', en: 'Create' },
		submit: { pt: 'Submeter', en: 'Submit' },
		subscribe: { pt: 'Subscrever', en: 'Subscribe' },
		save: { pt: 'Guardar alterações', en: 'Save changes' },
		saved: { pt: 'Guardado', en: 'Saved' },
		options: { pt: 'Opções', en: 'Options' },
		edit: { pt: 'Editar', en: 'Edit' },
		add: { pt: 'Adicionar', en: 'Add' },
		success: { pt: 'Sucesso!', en: 'Success!' },
		areYouSure: {
			pt: 'Tem a certeza? As alterações serão perdidas!',
			en: 'Are you sure? All changes will be lost!',
		},
		noOptions: { pt: 'Sem opções', en: 'No options' },

		send: { pt: 'Enviar', en: 'Send' },
		confirm: { pt: 'Confirmar', en: 'Confirm' },
		accept: { pt: 'Aceitar', en: 'Accept' },
		decline: { pt: 'Recusar', en: 'Decline' },

		cookiePolicy: { pt: 'Policy', en: 'Policy' },
		essentialCookies: { pt: 'Essential Only', en: 'Essential Only' },
		rejectCookies: { pt: 'Reject All', en: 'Reject All' },
		acceptCookies: { pt: 'Accept All', en: 'Accept All' },
		cookieWarning: {
			pt: "We'd like to set cookies to analyze traffic. View our {{cookiePolicy}}",
			en: "We'd like to set cookies to analyze traffic. View our {{cookiePolicy}}",
		},
		essentialCookieWarning: {
			pt: "This site uses necessary cookies to deliver its services. We'd like to set additional cookies to analyse traffic. View our {{cookiePolicy}}",
			en: "This site uses necessary cookies to deliver its services. We'd like to set additional cookies to analyse traffic. View our {{cookiePolicy}}",
		},
	},

	auth: {
		register: { pt: 'Registar', en: 'Sign-up' },
		recover: { pt: 'Recuperar', en: 'Recover' },
		verify: { pt: 'Verificar', en: 'Verify' },

		firstName: { pt: 'Primeiro nome', en: 'First name' },
		lastName: { pt: 'Último nome', en: 'Last name' },
		code: { pt: 'Código de verificação', en: 'Verification code' },
		newPassword: { pt: 'Nova Password', en: 'New Password' },

		loginMessage1: { pt: 'Já tem conta?', en: 'Have an account?' },
		loginMessage2: { pt: 'Faça login', en: 'Login' },

		andThe: { pt: ' e a ', en: ' and the ' },
		registerTerms: { pt: 'Li e aceito os', en: "I've read and accept the" },
		registerMessage1: { pt: 'Ainda não tem conta?', en: "Don't have an account?" },
		registerMessage2: { pt: 'Registe-se', en: 'Sign-up' },

		recoverMessage: {
			pt: 'Esqueceu-se da password?',
			en: 'Forgot your password?',
		},

		codeMessage: {
			pt: 'Um código foi enviado para o seu e-mail para verificar a sua conta',
			en: 'A code was sent to your e-mail to verify your account',
		},
	},

	settings: {
		title: { pt: 'Definições', en: 'Settings' },

		drawer: {
			account: {
				title: { pt: 'Conta', en: 'Account' },
				phone: { pt: 'Telemóvel', en: 'Phone number' },
				profileImage: { pt: 'Imagem de perfil', en: 'Profile image' },

				savedSuccess: { pt: 'Sucesso!', en: 'Success!' },
				savedSuccessText: {
					pt: 'Definições guardadas com sucesso',
					en: 'Settings saved successfully',
				},
				emailError: {
					pt: 'Este e-mail já existe',
					en: 'This e-mail is already taken',
				},
			},
		},

		help: { pt: 'Ajuda', en: 'Help' },
		logout: { pt: 'Sair', en: 'Logout' },
	},

	extras: {
		newUpdate: {
			pt: 'Nova atualização! Por favor faça refresh',
			en: 'New update! Please refresh the page',
		},
		connectionLost: {
			pt: 'Ligação com o servidor perdida!',
			en: 'Lost connection to server!',
		},

		somethingWrong: {
			pt: 'Ocorreu um erro',
			en: 'Something went wrong',
		},
		noConnection: {
			pt: 'Sem ligação',
			en: 'No connection',
		},
	},
}
