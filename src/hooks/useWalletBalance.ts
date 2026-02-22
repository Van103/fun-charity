import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletBalance {
  eth: string;
  matic: string;
  ethUsd: string;
  maticUsd: string;
  loading: boolean;
  error: string | null;
}

// Public RPC endpoints
const RPC_ENDPOINTS = {
  ethereum: 'https://cloudflare-eth.com',
  polygon: 'https://polygon-rpc.com',
};

// Approximate prices for display (in production, fetch from an API)
const APPROX_PRICES = {
  ETH: 2300,
  MATIC: 0.85,
};

export function useWalletBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<WalletBalance>({
    eth: '0',
    matic: '0',
    ethUsd: '0',
    maticUsd: '0',
    loading: false,
    error: null,
  });
  const [lastFetch, setLastFetch] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchBalances = useCallback(async (force = false) => {
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return;
    }

    // Skip if cached and not forced
    if (!force && Date.now() - lastFetch < CACHE_DURATION) {
      return;
    }

    setBalance(prev => ({ ...prev, loading: true, error: null }));

    try {
      const ethProvider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.ethereum);
      // Only fetch ETH, skip Polygon (API key disabled)
      const ethBalance = await ethProvider.getBalance(walletAddress).catch(() => BigInt(0));

      const ethValue = parseFloat(ethers.formatEther(ethBalance));
      const ethUsd = (ethValue * APPROX_PRICES.ETH).toFixed(2);

      setBalance({
        eth: ethValue.toFixed(6),
        matic: '0',
        ethUsd,
        maticUsd: '0',
        loading: false,
        error: null,
      });
      setLastFetch(Date.now());
    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải số dư',
      }));
    }
  }, [walletAddress, lastFetch]);

  // Do NOT auto-fetch on mount - only fetch on demand via refetch
  
  return {
    ...balance,
    refetch: () => fetchBalances(true),
  };
}
