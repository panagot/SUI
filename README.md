# Sui Transaction Explainer

A beautiful, user-friendly web app that explains Sui blockchain transactions in plain language. Simply paste a transaction digest and get a clear breakdown of what happened.

![Sui Transaction Explainer](https://img.shields.io/badge/Sui-Transaction%20Explainer-blue)

## Features

- 🔍 **Transaction Search**: Enter any Sui transaction digest to get detailed explanations
- 📊 **Plain Language Summaries**: Understand what happened without technical jargon
- 🎨 **Beautiful UI**: Modern, responsive design with dark mode support
- ⚡ **Real-time Data**: Fetches live data from Sui mainnet
- 💰 **Gas Breakdown**: See computation costs, storage costs, and rebates
- 📦 **Object Changes**: Track all objects created, transferred, or modified
- 🔗 **Move Call Details**: View the exact package, module, and function called

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: TailwindCSS with custom theme
- **Blockchain SDK**: @mysten/sui (official Sui TypeScript SDK)
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Data Flow

1. User enters transaction digest
2. App fetches transaction data from Sui RPC endpoint
3. Transaction parser converts raw data to human-readable format
4. UI components display the formatted information

### Key Components

- **`app/page.tsx`**: Main page with search interface
- **`lib/suiClient.ts`**: Sui blockchain client configuration
- **`lib/transactionParser.ts`**: Converts raw transaction data to readable format
- **`components/TransactionDetails.tsx`**: Displays transaction information beautifully
- **`types/transaction.ts`**: TypeScript interfaces for type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sui-transaction-explainer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy with one click

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `.next` folder to Netlify
3. Configure build command: `npm run build`
4. Configure output directory: `.next`

### Environment Variables

No environment variables needed! The app uses Sui public RPC endpoints.

## Usage

1. **Enter a Transaction Digest**: Paste any Sui transaction hash in the search box
2. **Click "Explain"**: The app fetches and parses the transaction
3. **View Results**: See a clear breakdown of:
   - Transaction summary in plain language
   - All actions performed (transfers, creations, mutations)
   - Object changes with types
   - Move function calls
   - Gas usage breakdown
4. **Explain Another**: Click the button to analyze another transaction

## Data Source

The app uses the official Sui mainnet RPC endpoint via `@mysten/sui` SDK:
- **Endpoint**: Sui mainnet fullnode
- **Methods Used**:
  - `sui_getTransactionBlock` with full options
  - Includes: effects, events, object changes, balance changes

## Features Breakdown

### Transaction Summary
- Plain language description of what happened
- Success/failure status
- Sender address
- Timestamp

### Object Changes
- Created objects
- Transferred objects (with recipients)
- Mutated objects
- Deleted/wrapped objects
- Object types formatted for readability

### Move Call Information
- Package address
- Module name
- Function name
- Full qualified name

### Gas Breakdown
- Computation cost
- Storage cost
- Storage rebate
- Total gas used (in SUI)

## Future Enhancements

- 📈 Transaction visualization with flow diagrams
- 🔗 Explorer links to objects and addresses
- 📱 Mobile app version
- 🌐 Support for testnet/devnet
- 📊 Historical transaction analytics
- 🔔 Transaction monitoring/alerts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for the Sui ecosystem

