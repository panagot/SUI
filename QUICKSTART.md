# Quick Start Guide

Get the Sui Transaction Explainer running in under 5 minutes!

## 🚀 Run Locally

### 1. Install Dependencies
```bash
cd sui-transaction-explainer
npm install --legacy-peer-deps
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Try It Out

### Example Transaction Digests

Try these real Sui mainnet transactions:

1. **Simple Transfer**
   ```
   HkPo6rYPyDY53x1MBszvSZVZyixVN5CJaXSUFK9Ai9jU
   ```

2. **Complex Transaction**
   ```
   9dtz7YneMXpKzL6PQGPTdLvLVTYjVQj3jFRkZQRGmfXk
   ```

### How to Use

1. **Paste a transaction digest** in the search box
2. **Click "Explain"** or press Enter
3. **View the results**:
   - Transaction summary in plain English
   - Visual flow diagram
   - Object changes breakdown
   - Gas usage details
   - Move function call info
4. **Click "Explain Another Transaction"** to analyze more

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

## 🌐 Find Transaction Digests

Where to get transaction hashes to test:

1. **Sui Explorer**: [https://suiscan.xyz](https://suiscan.xyz)
   - Browse recent transactions
   - Copy the transaction hash

2. **Your Own Wallet**
   - Check your transaction history
   - Copy any transaction ID

3. **Sui CLI**
   ```bash
   sui client transactions
   ```

## 💡 Features to Explore

- ✅ Plain language explanations
- ✅ Visual transaction flow
- ✅ Detailed object changes
- ✅ Gas breakdown
- ✅ Move call information
- ✅ Dark mode support
- ✅ Mobile responsive

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install --legacy-peer-deps
```

### RPC Errors
- Check internet connection
- Verify transaction digest is valid
- Sui RPC might be temporarily down (retry in a moment)

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Proposal](./PROPOSAL.md) - Project details for RFP submission

## 🎉 Success!

Your Sui Transaction Explainer is now running!

Start exploring Sui transactions in a whole new way. 🚀

