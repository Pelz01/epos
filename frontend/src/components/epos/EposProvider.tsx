"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import {
  BASE_SEPOLIA_CHAIN_ID,
  EPOS_PROFILES_ADDRESS,
  EPOS_REQUESTS_ADDRESS,
  USDC_ADDRESS,
  encodeApproveUsdc,
  encodeClaimUsername,
  encodeCreateRequest,
  encodeFulfillRequest,
  eposProfilesAbi,
  eposRequestsAbi,
  fetchOnchainRequests,
  friendlyContractError,
  getEthBalance,
  getUsdcBalance,
  publicClient,
  requestSlug,
  sendContractTransaction,
} from "./contracts";

type RequestStatus = "open" | "fulfilled";

export interface EposUser {
  id: string;
  identifier: string;
  displayName: string;
  walletAddress: string | null;
  username: string | null;
}

export interface EposRequest {
  id: string;
  slug: string;
  username: string;
  amount: number;
  reason: string;
  createdAt: string;
  status: RequestStatus;
  fulfilledBy: string | null;
  fulfilledAt: string | null;
  onchainRequestId?: string;
}

export interface EposReceipt {
  id: string;
  requestId: string;
  slug: string;
  from: string;
  to: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface EposState {
  profiles: Record<string, { username: string }>;
  requests: EposRequest[];
  receipts: EposReceipt[];
}

interface CreateRequestInput {
  amount: number;
  reason: string;
}

interface ActionResult {
  ok: boolean;
  message?: string;
}

interface CreateRequestResult extends ActionResult {
  request?: EposRequest;
}

interface PayRequestResult extends ActionResult {
  receipt?: EposReceipt;
}

interface WalletBalances {
  eth: number;
  usdc: number;
}

interface EposContextValue {
  authReady: boolean;
  authConfigured: boolean;
  authenticated: boolean;
  currentUser: EposUser | null;
  requests: EposRequest[];
  receipts: EposReceipt[];
  balances: WalletBalances | null;
  isFeedLoading: boolean;
  feedError: string;
  login: () => ActionResult;
  loginWithWallet: () => ActionResult;
  logout: () => Promise<void>;
  refreshOnchainData: () => Promise<ActionResult>;
  refreshBalances: () => Promise<ActionResult>;
  claimUsername: (username: string) => Promise<ActionResult>;
  createRequest: (input: CreateRequestInput) => Promise<CreateRequestResult>;
  payRequest: (slug: string) => Promise<PayRequestResult>;
}

const STORAGE_KEY = "epos.phase1.state.v2";

function createInitialState(): EposState {
  return {
    profiles: {},
    requests: [],
    receipts: [],
  };
}

const EposContext = createContext<EposContextValue | null>(null);

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_]/g, "");
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function validateState(raw: unknown): EposState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as EposState;
  if (!Array.isArray(candidate.requests) || !Array.isArray(candidate.receipts)) {
    return null;
  }
  return {
    profiles: candidate.profiles ?? {},
    requests: candidate.requests,
    receipts: candidate.receipts,
  };
}

function usePersistedState() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [state, setState] = useState<EposState>(createInitialState);
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(validateState(JSON.parse(raw)) ?? createInitialState());
        }
      } catch {
        setState(createInitialState());
      } finally {
        setHasLoadedLocalState(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !hasLoadedLocalState) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hasLoadedLocalState, isHydrated, state]);

  return [state, setState, isHydrated] as const;
}

function getUserEmail(user: ReturnType<typeof usePrivy>["user"]): string {
  return user?.email?.address ?? "Signed in";
}

function getWalletAddress(user: ReturnType<typeof usePrivy>["user"]): string | null {
  return user?.wallet?.address ?? user?.linkedAccounts.find((account) => "address" in account)?.address ?? null;
}

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function EposStateProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const [state, setState, isHydrated] = usePersistedState();
  const [onchainUsername, setOnchainUsername] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const userId = user?.id ?? null;
  const walletAddress = getWalletAddress(user);
  const username = onchainUsername ?? (userId ? state.profiles[userId]?.username ?? null : null);

  const activeWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletClientType === "privy") ?? wallets[0] ?? null,
    [wallets],
  );

  const getWalletProvider = useCallback(async (): Promise<{
    provider: Eip1193Provider;
    account: `0x${string}`;
  }> => {
    if (!activeWallet) {
      throw new Error("Privy wallet is not ready yet.");
    }
    await activeWallet.switchChain(BASE_SEPOLIA_CHAIN_ID);
    const provider = (await activeWallet.getEthereumProvider()) as Eip1193Provider;
    return {
      provider,
      account: activeWallet.address as `0x${string}`,
    };
  }, [activeWallet]);

  const refreshOnchainData = useCallback(async (): Promise<ActionResult> => {
    setIsFeedLoading(true);
    setFeedError("");
    try {
      const onchainRequests = await fetchOnchainRequests();
      setState((prev) => {
        const localById = new Map(
          prev.requests.map((request) => [request.onchainRequestId ?? request.id, request]),
        );
        return {
          ...prev,
          requests: onchainRequests.map((request) => {
            const local = localById.get(request.id);
            return {
              id: request.id,
              slug: requestSlug(request.username, request.reason, request.id),
              username: request.username,
              amount: request.amount,
              reason: request.reason,
              createdAt: request.createdAt,
              status: request.status,
              fulfilledBy:
                local?.status === "fulfilled" && local.fulfilledBy
                  ? local.fulfilledBy
                  : request.fulfilledBy
                    ? shortAddress(request.fulfilledBy)
                    : null,
              fulfilledAt: request.fulfilledAt,
              onchainRequestId: request.id,
            };
          }),
        };
      });
      return { ok: true };
    } catch (error) {
      const message = friendlyContractError(error);
      setFeedError(message);
      return { ok: false, message };
    } finally {
      setIsFeedLoading(false);
    }
  }, [setState]);

  const refreshBalances = useCallback(async (): Promise<ActionResult> => {
    if (!walletAddress) {
      setBalances(null);
      return { ok: false, message: "Sign in first." };
    }
    try {
      const [eth, usdc] = await Promise.all([
        getEthBalance(walletAddress as `0x${string}`),
        getUsdcBalance(walletAddress as `0x${string}`),
      ]);
      setBalances({ eth, usdc });
      return { ok: true };
    } catch (error) {
      const message = friendlyContractError(error);
      return { ok: false, message };
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const timeout = window.setTimeout(() => {
      refreshOnchainData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isHydrated, refreshOnchainData]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshBalances();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshBalances]);

  useEffect(() => {
    let cancelled = false;
    async function loadOnchainUsername() {
      if (!walletAddress || !isHydrated) {
        setOnchainUsername(null);
        return;
      }
      try {
        const usernameFromChain = await publicClient.readContract({
          address: EPOS_PROFILES_ADDRESS,
          abi: eposProfilesAbi,
          functionName: "usernameByWallet",
          args: [walletAddress as `0x${string}`],
        });
        if (!cancelled) {
          const clean = usernameFromChain || null;
          setOnchainUsername(clean);
          if (clean && userId) {
            setState((prev) => ({
              ...prev,
              profiles: {
                ...prev.profiles,
                [userId]: { username: clean },
              },
            }));
          }
        }
      } catch {
        if (!cancelled) {
          setOnchainUsername(null);
        }
      }
    }
    loadOnchainUsername();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, setState, userId, walletAddress]);

  const currentUser = useMemo<EposUser | null>(() => {
    if (!authenticated || !user) {
      return null;
    }
    const identifier = getUserEmail(user);
    return {
      id: user.id,
      identifier,
      displayName: username ? `@${username}` : identifier,
      walletAddress,
      username,
    };
  }, [authenticated, user, username, walletAddress]);

  const login = useCallback((): ActionResult => {
    if (!ready) {
      return { ok: false, message: "Privy is still loading." };
    }
    privyLogin({ loginMethods: ["email"] });
    return { ok: true };
  }, [privyLogin, ready]);

  const loginWithWallet = useCallback((): ActionResult => {
    if (!ready) {
      return { ok: false, message: "Privy is still loading." };
    }
    privyLogin({ loginMethods: ["wallet"] });
    return { ok: true };
  }, [privyLogin, ready]);

  const claimUsername = useCallback(
    async (value: string): Promise<ActionResult> => {
      if (!userId) {
        return { ok: false, message: "Sign in first." };
      }
      if (!walletsReady) {
        return { ok: false, message: "Privy wallet is still loading." };
      }
      const clean = normalizeUsername(value);
      if (clean.length < 3 || clean.length > 15) {
        return { ok: false, message: "Username must be 3-15 characters." };
      }

      try {
        const { provider, account } = await getWalletProvider();
        const ethBalance = await getEthBalance(account);
        if (ethBalance <= 0) {
          return { ok: false, message: "This wallet needs Base Sepolia ETH for gas." };
        }
        await sendContractTransaction({
          provider,
          account,
          to: EPOS_PROFILES_ADDRESS,
          data: encodeClaimUsername(clean),
        });
      } catch (error) {
        const message = friendlyContractError(error);
        return { ok: false, message };
      }

      setOnchainUsername(clean);
      setState((prev) => {
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [userId]: { username: clean },
          },
        };
      });
      await refreshBalances();
      return { ok: true };
    },
    [getWalletProvider, refreshBalances, setState, userId, walletsReady],
  );

  const createRequest = useCallback(
    async (input: CreateRequestInput): Promise<CreateRequestResult> => {
      const amount = Number(input.amount);
      const reason = input.reason.trim();
      if (!currentUser?.username) {
        return { ok: false, message: "Claim your username first." };
      }
      if (!walletsReady) {
        return { ok: false, message: "Privy wallet is still loading." };
      }
      const claimedUsername = currentUser.username;
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: "Enter a valid USDC amount." };
      }
      if (!reason) {
        return { ok: false, message: "Enter a reason for your request." };
      }

      let onchainRequestId: bigint;
      try {
        const { provider, account } = await getWalletProvider();
        const ethBalance = await getEthBalance(account);
        if (ethBalance <= 0) {
          return { ok: false, message: "This wallet needs Base Sepolia ETH for gas." };
        }
        onchainRequestId = await publicClient.readContract({
          address: EPOS_REQUESTS_ADDRESS,
          abi: eposRequestsAbi,
          functionName: "nextRequestId",
        });
        await sendContractTransaction({
          provider,
          account,
          to: EPOS_REQUESTS_ADDRESS,
          data: encodeCreateRequest(amount, reason),
        });
      } catch (error) {
        const message = friendlyContractError(error);
        return { ok: false, message };
      }

      const created: EposRequest = {
        id: onchainRequestId.toString(),
        slug: requestSlug(claimedUsername, reason, onchainRequestId.toString()),
        username: claimedUsername,
        amount,
        reason,
        createdAt: new Date().toISOString(),
        status: "open",
        fulfilledBy: null,
        fulfilledAt: null,
        onchainRequestId: onchainRequestId.toString(),
      };
      setState((prev) => {
        return {
          ...prev,
          requests: [created, ...prev.requests],
        };
      });

      await refreshOnchainData();
      return { ok: true, request: created };
    },
    [currentUser, getWalletProvider, refreshOnchainData, setState, walletsReady],
  );

  const payRequest = useCallback(
    async (slug: string): Promise<PayRequestResult> => {
      if (!currentUser) {
        return { ok: false, message: "Sign in first." };
      }
      if (!walletsReady) {
        return { ok: false, message: "Privy wallet is still loading." };
      }

      const target = state.requests.find((request) => request.slug === slug);
      if (!target) {
        return { ok: false, message: "Request not found." };
      }
      if (target.status === "fulfilled") {
        return { ok: false, message: "This request is already fulfilled." };
      }
      if (currentUser.username && currentUser.username === target.username) {
        return { ok: false, message: "You cannot fulfill your own request." };
      }
      if (!target.onchainRequestId) {
        return { ok: false, message: "This request is missing its onchain id." };
      }

      try {
        const { provider, account } = await getWalletProvider();
        const [ethBalance, usdcBalance] = await Promise.all([getEthBalance(account), getUsdcBalance(account)]);
        if (ethBalance <= 0) {
          return { ok: false, message: "This wallet needs Base Sepolia ETH for gas." };
        }
        if (usdcBalance < target.amount) {
          return { ok: false, message: `This wallet only has ${usdcBalance.toFixed(2)} Base Sepolia USDC.` };
        }
        await sendContractTransaction({
          provider,
          account,
          to: USDC_ADDRESS,
          data: encodeApproveUsdc(target.amount),
        });
        await sendContractTransaction({
          provider,
          account,
          to: EPOS_REQUESTS_ADDRESS,
          data: encodeFulfillRequest(BigInt(target.onchainRequestId)),
        });
      } catch (error) {
        const message = friendlyContractError(error);
        return { ok: false, message };
      }

      let receipt: EposReceipt | undefined;
      let message = "";
      setState((prev) => {
        const index = prev.requests.findIndex((request) => request.slug === slug);
        if (index === -1) {
          message = "Request not found.";
          return prev;
        }

        const target = prev.requests[index];
        if (target.status === "fulfilled") {
          message = "This request is already fulfilled.";
          return prev;
        }
        if (currentUser.username && currentUser.username === target.username) {
          message = "You cannot fulfill your own request.";
          return prev;
        }

        const now = new Date().toISOString();
        const sender = currentUser.username ? `@${currentUser.username}` : currentUser.identifier;
        const updatedRequests = [...prev.requests];
        updatedRequests[index] = {
          ...target,
          status: "fulfilled",
          fulfilledBy: sender,
          fulfilledAt: now,
        };
        receipt = {
          id: generateId("receipt"),
          requestId: target.id,
          slug: target.slug,
          from: sender,
          to: `@${target.username}`,
          amount: target.amount,
          reason: target.reason,
          createdAt: now,
        };
        return {
          ...prev,
          requests: updatedRequests,
          receipts: [receipt, ...prev.receipts],
        };
      });

      await Promise.all([refreshOnchainData(), refreshBalances()]);
      return receipt ? { ok: true, receipt } : { ok: false, message: message || "Payment failed." };
    },
    [currentUser, getWalletProvider, refreshBalances, refreshOnchainData, setState, state.requests, walletsReady],
  );

  const value = useMemo<EposContextValue>(
    () => ({
      authReady: ready && isHydrated,
      authConfigured: true,
      authenticated,
      currentUser,
      requests: state.requests,
      receipts: state.receipts,
      balances,
      isFeedLoading,
      feedError,
      login,
      loginWithWallet,
      logout: privyLogout,
      refreshOnchainData,
      refreshBalances,
      claimUsername,
      createRequest,
      payRequest,
    }),
    [
      authenticated,
      balances,
      claimUsername,
      createRequest,
      currentUser,
      feedError,
      isHydrated,
      isFeedLoading,
      login,
      loginWithWallet,
      payRequest,
      privyLogout,
      ready,
      refreshBalances,
      refreshOnchainData,
      state.receipts,
      state.requests,
    ],
  );

  return <EposContext.Provider value={value}>{children}</EposContext.Provider>;
}

function MissingPrivyProvider({ children }: { children: React.ReactNode }) {
  const [state] = usePersistedState();

  const value = useMemo<EposContextValue>(
    () => ({
      authReady: true,
      authConfigured: false,
      authenticated: false,
      currentUser: null,
      requests: state.requests,
      receipts: state.receipts,
      balances: null,
      isFeedLoading: false,
      feedError: "",
      login: () => ({ ok: false, message: "Set NEXT_PUBLIC_PRIVY_APP_ID to enable real Privy sign-in." }),
      loginWithWallet: () => ({ ok: false, message: "Set NEXT_PUBLIC_PRIVY_APP_ID to enable wallet sign-in." }),
      logout: async () => {},
      refreshOnchainData: async () => ({ ok: false, message: "Set NEXT_PUBLIC_PRIVY_APP_ID first." }),
      refreshBalances: async () => ({ ok: false, message: "Sign in with Privy first." }),
      claimUsername: async () => ({ ok: false, message: "Sign in with Privy first." }),
      createRequest: async () => ({ ok: false, message: "Sign in with Privy first." }),
      payRequest: async () => ({ ok: false, message: "Sign in with Privy first." }),
    }),
    [state.receipts, state.requests],
  );

  return <EposContext.Provider value={value}>{children}</EposContext.Provider>;
}

export function EposProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <MissingPrivyProvider>{children}</MissingPrivyProvider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet"],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          accentColor: "#2563eb",
          logo: "/favicon.ico",
        },
      }}
    >
      <EposStateProvider>{children}</EposStateProvider>
    </PrivyProvider>
  );
}

export function useEpos(): EposContextValue {
  const context = useContext(EposContext);
  if (!context) {
    throw new Error("useEpos must be used inside EposProvider.");
  }
  return context;
}
