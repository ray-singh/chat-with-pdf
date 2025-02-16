# Doxly - AI-Powered PDF Chat

Doxly is an interactive application that transforms PDF documents into conversational interfaces, allowing users to chat with their documents using AI.
<img width="1508" alt="Screenshot 2025-02-12 at 3 49 21 PM" src="https://github.com/user-attachments/assets/5e9bf71d-efac-4d9e-8911-933ae98761e5" />

## Features

- 📑 PDF document upload and processing
- 💬 Interactive chat interface with your documents
- 🤖 AI-powered document analysis and responses
- 🔐 Secure user authentication
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: DrizzleORM, AWS S3, NeonDB, PineconeDB, Next.js API routes
- **Authentication**: Clerk
- **AI Integration**: OpenAI, LangChain, Vercel AI SDK

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/doxly.git
    cd doxly
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
    ```bash
    cp .env.example .env.local
    ```

    Fill in the following variables in `.env.local`:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    OPENAI_API_KEY=
    DATABASE_URL=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=
    AWS_S3_BUCKET=
    ```

4. Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Sign in using your account.
2. Upload a PDF document.
3. Start chatting with your document.
4. Navigate through your document using AI-powered assistance.
5. NOTE: If a response is taking too long to appear, please reload the chat page. 

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](http://_vscodecontentref_/1) file for details.
