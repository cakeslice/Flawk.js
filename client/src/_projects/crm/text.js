/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
	common: {
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

		cookieWarning: {
			pt:
				'ESTE SITE UTILIZA COOKIES PARA FORNECER OS SERVIÇOS E ANALISAR O TRÁFEGO. AO USAR ESTE SITE, CONCORDA COM A SUA UTILIZAÇÃO DE COOKIES',
			en:
				'THIS SITE USES COOKIES TO DELIVER ITS SERVICES AND TO ANALYSE TRAFFIC. BY USING THIS SITE, YOU AGREE TO ITS USE OF COOKIES',
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

		privacy: {
			title: {
				pt: 'Política de Privacidade e Cookies',
				en: 'Privacy & Cookies Policy',
			},
		},
		terms: {
			title: {
				pt: 'Termos de Serviço',
				en: 'Terms of Service',
			},
		},
	},
}
