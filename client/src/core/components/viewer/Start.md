## ⚠️ This boilerplate is quite outdated and is missing important documentation. Something like Next.js combined with Next-UI is a much better alternative that includes a lot of the features of this boilerplate

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

&nbsp;

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

  - Built with **Express** and **Mongoose**
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

- Clone the [repo](https://github.com/cakeslice/Flawk.js)

- To run the **Backend**:

  - Create a **dev.env** file in _/server/\_env_ based on **dev.env.template**
  - In a terminal run:
    ```bash
    cd server && npm install --force && npm run dev
    ```

- To run the **Frontend**:
  - In a terminal run:
    ```bash
    cd client && npm install --force && npm run dev
    ```
- Note: **VSCode** is highly recommended and the following extensions should be installed:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
