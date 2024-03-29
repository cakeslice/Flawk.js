<center>
	<h1>Flawk</h1>
</center>

<center>Full-stack ready for liftoff</center>

[<center>![CircleCI](https://circleci.com/gh/cakeslice/Flawk.js/tree/main.svg?style=shield)</center>](https://circleci.com/gh/cakeslice/Flawk.js/tree/main)

---

<center>Strongly opinionated <b>full-stack</b> boilerplate powered by <b>React</b> and <b>Express/Mongoose</b></center>

&nbsp;

## ⚠️ This boilerplate is quite outdated and is missing important documentation. Something like Next.js combined with Next-UI is a much better alternative that includes a lot of the features of this boilerplate

&nbsp;
&nbsp;

### Keep in mind that Flawk is not suitable for beginners

- You need to be comfortable with **TypeScript**, **React** and **Express/Mongoose** to use this boilerplate

&nbsp;

## ✨ Documentation and Examples: [**flawk.cakeslice.dev**](https://flawk.cakeslice.dev)

&nbsp;

## 🚀 Features

- Free and open-source with **MIT license**
- **TypeScript** based
- Already configured with **best pratices**:
  - Linting/formatting with ESLint and Prettier
  - Testing with Jest and Cypress
  - Continuous Integration with CircleCI
  - Building and deployment with Docker
  - Error monitoring with [Sentry](https://sentry.io)
- Optimized **npm scripts** for development, building, testing and deploying
- Deploy easily to [**CapRover**](https://caprover.com/) with 1-click

- ### 🖥️ Frontend: _/client_

  - Built with **React**, [**Vite**](https://vitejs.dev) and **React Router**
  - Style and customize **25+** built-in components with consistency
  - Seamless backend integration
  - Build for iOS and Android with [Capacitor](https://capacitorjs.com)
  - Light/Dark mode support across the board
  - Easily setup third-party services:
    - Google Analytics
    - Google Ads
    - Google Recaptcha
    - [Stripe](https://stripe.com) checkout

- ### 🗄️ Backend: _/server_

  - Built with **express** and **mongoose**
  - Built-in security, encryption, validation and compression
  - Easy authentication and permissions
  - Websocket support
  - E-mail, SMS and push notifications
  - Easily setup third-party services:
    - S3 storage
    - SMTP E-mail
    - [Logtail](https://logtail.com)
    - Google Recaptcha
    - [Vonage](https://www.vonage.com) SMS
    - [Stripe](https://stripe.com) checkout
  - TypeScript interface generation for Mongoose schemas
  - Automatic OpenAPI generation and validation:
    ```ts
	 // All objects with this structure are injected in the OpenAPI spec
    const Login = {
      call: "/client/login",
      method: "post",
      description: "Login a user",
      body: {} as {
        email: string; // Required
        password: string; // Required
		  rememberMe?: boolean; // Optional
      },
    };
    router.postAsync(Login.call, async (req, res) => {
      const body: typeof Login.body = req.body;

      //...
    });
    ```

&nbsp;

## 💾 Setup

- Clone the repo

- To run the project for development:
	- *Backend*:
		- cd server
		- npm install --force
		- npm run start:dev
		- **Note**: To run you need this file: *server/_env/dev.env*
	- *Frontend*:
		- cd client
		- npm install --force
		- npm run start:dev
		- **Note**: To run you need this file: *client/_env/dev.env*
			- You will need a docker container repository to set the DOCKER_IMAGE var in *client/_env/build-prod.env*

- To deploy:
	- *Backend*:
		- cd server
		- npm run build_docker:prod
		- **Note**: To deploy you need this file: *server/_env/build-prod.env*
		   - You will need a docker container repository to set the DOCKER_IMAGE var in *server/_env/build-prod.env*
			- Also you need to set the env variables in whatever system you're using to run the app based on *server/_env/prod.env* (for example in the CapRover app)
	- *Frontend*:
		- cd client
		- npm run build_docker:prod
		- **Note**: To deploy you need this file: *client/_env/prod.env*

- **VSCode** is highly recommended and the following extensions should be installed:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
