import { useState} from 'react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import './index.css';

function App() {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>('Fetching...');
  const [copied, setCopied] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);

  // Connect to Polkadot API
  const initApi = async () => {
    const provider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider });
    setApi(api);
    return api;
  };

  // Connect wallet & fetch account info
  const connectWallet = async () => {
    const extensions = await web3Enable('My PAPI Dapp');
    if (!extensions.length) {
      alert('Polkadot.js extension not found!');
      return;
    }

    const accs = await web3Accounts();
    if (!accs.length) {
      alert('No accounts found!');
      return;
    }

    setAccounts(accs);
    const firstAddress = accs[0].address;
    setSelectedAccount(firstAddress);

    const api = await initApi();
    const { data: balanceData } = await api.query.system.account(firstAddress);
    setBalance(balanceData.free.toHuman());
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (!selectedAccount || !api) return;
    const { data: balanceData } = await api.query.system.account(selectedAccount);
    setBalance(balanceData.free.toHuman());
  };

  // Handle account change
  const handleAccountChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addr = e.target.value;
    setSelectedAccount(addr);
    if (api) {
      const { data: balanceData } = await api.query.system.account(addr);
      setBalance(balanceData.free.toHuman());
    }
  };

  // Copy address
  const copyToClipboard = () => {
    if (!selectedAccount) return;
    navigator.clipboard.writeText(selectedAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setSelectedAccount(null);
    setAccounts([]);
    setBalance(null);
    setApi(null);
    setCopied(false);
  };

  

  return (
    <div className="min-h-screen bg-white text-pink-600 p-6 font-sans flex flex-col items-center justify-center">
      <img
        src="https://res.cloudinary.com/dxswouxj5/image/upload/v1743968435/images_cdg6ip.png"
        alt="polkadot logo"
        className="w-20 h-20 mb-2"
      />
      <h1 className="text-3xl font-bold mb-6">Connect to Polkadot wallet with PAPI</h1>
      <p className="text-lg mb-6 max-w-xl text-center">
        Connect your Polkadot wallet to a React app using the Polkadot.js extension.
      </p>

      {!selectedAccount ? (
        <button
          onClick={connectWallet}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded shadow"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-pink-50 p-4 rounded-xl shadow w-full max-w-md">
          <label className="block mb-2 text-pink-800 font-semibold">Select Account</label>
          <select
            value={selectedAccount}
            onChange={handleAccountChange}
            className="w-full p-2 rounded border border-pink-300 mb-4"
          >
            {accounts.map((acc) => (
              <option key={acc.address} value={acc.address}>
                {acc.meta.name || 'No Name'} - {acc.address}
              </option>
            ))}
          </select>

          <div className="mb-2">
            <strong>Address:</strong> {selectedAccount}{' '}
            <button
              onClick={copyToClipboard}
              className="ml-2 text-sm bg-gray-600 px-2 py-1 rounded hover:bg-gray-300 text-white"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mb-4">
            <strong>Balance:</strong> {balance ?? 'Fetching...'}
          </div>

          <div className="flex justify-between">
            <button
              onClick={refreshBalance}
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded"
            >
              Refresh Balance
            </button>
            <button
              onClick={disconnectWallet}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
