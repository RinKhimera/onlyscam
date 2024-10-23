<h1 align="center">FanTribe</h1>

<div align="center">
The name says everything.. 
</div>

## Prerequisites

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

## Installation

**Cloning the Repository**

Open your terminal or command prompt, clone the repository, and navigate to the directory:

```bash
git clone https://github.com/RinKhimera/fantribe.git
cd fantribe
```

**Install the dependencies**

Install the project dependencies using npm or bun:

```bash
npm install
# or
bun install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following content:

```env
#Backend
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

#Authentification with Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=

#Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=

#Pawapay
NEXT_PUBLIC_PAWAPAY_SANDBOX_API_TOKEN=
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
bun run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project. You're done!

## Tech Stack

- Next.js
- Convex
- TailwindCSS
- Shadcn UI
- TypeScript

## Deployment

This app is deployed on [Vercel Platform](https://vercel.com). It is the easiest way to deploy your Next.js app and it's from the creators of Next.js.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Author

[Samuel Pokam](https://github.com/RinKhimera)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Like what I'm doing? Give it a star
