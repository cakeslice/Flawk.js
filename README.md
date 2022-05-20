<center>
	<h1>Flawk</h1>
</center>

<center>Full-stack ready for liftoff</center>

[<center>![CircleCI](https://circleci.com/gh/cakeslice/Flawk.js/tree/main.svg?style=shield)</center>](https://circleci.com/gh/cakeslice/Flawk.js/tree/main)

---

<center>Strongly opinionated <b>full-stack</b> boilerplate powered by <b>React</b> and <b>Express/Mongoose</b></center>

&nbsp;

## ⚠️ This project is a **work in progress** and is missing important documentation

&nbsp;
&nbsp;

### Keep in mind that Flawk is not suitable for beginners

- You need to be comfortable with **TypeScript**, **React** and **Express/Mongoose** to use this boilerplate

&nbsp;

The Frontend and Backend can be used in isolation but to get the most out of this project you should use it for **full-stack** development

&nbsp;

---

&nbsp;

## ✨ Documentation and Examples: [**flawk.cakeslice.dev**](https://flawk.cakeslice.dev)

&nbsp;

---

&nbsp;

## 🚀 Project Features

- Free and open-source with **MIT license**
- **TypeScript** based
- Already configured with **best pratices**:
  - Linting/formatting with ESLint and Prettier
  - Testing with Jest and Cypress
  - Continuous Integration with CircleCI
  - Building and deployment with Docker
  - Error monitoring with [Sentry](https://sentry.io)
- Optimized **npm scripts** for development, building, testing and deploying
- Deploy easily to **[CapRover](https://caprover.com/)** with 1-click

- ### 🖥️ Frontend: _/client_

  - Built with **create-react-app**
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
  - Automatic OpenAPI generation and validation using types:

    ```ts
    const Login = {
      call: "/client/login",
      method: "post",
      description: "Login a user",
      body: {} as {
        email: string;
        password: string;
      },
      responses: {
        _200: {
          body: {} as {
            token: string;
          },
        },
      },
    };
    router.postAsync(Login.call, async (req, res) => {
      const body: typeof Login.body = req.body;

      //...
    });
    ```

&nbsp;

---

&nbsp;

## 💾 Running the project

- Clone the repo

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
  - [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
  - [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)
  - [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)

&nbsp;

---

&nbsp;

## 📔 Getting started

- Work in progress

&nbsp;

---

&nbsp;

## 📦 Deployment

- Work in progress
