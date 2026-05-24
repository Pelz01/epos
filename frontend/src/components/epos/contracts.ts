import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  formatEther,
  formatUnits,
  http,
  parseUnits,
  custom,
} from "viem";
import { baseSepolia } from "viem/chains";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_EXPLORER_TX = "https://sepolia.basescan.org/tx";

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_BASE_SEPOLIA_USDC as `0x${string}`;
export const EPOS_PROFILES_ADDRESS = process.env.NEXT_PUBLIC_EPOS_PROFILES as `0x${string}`;
export const EPOS_REQUESTS_ADDRESS = process.env.NEXT_PUBLIC_EPOS_REQUESTS as `0x${string}`;
export const EPOS_REPUTATION_ADDRESS = process.env.NEXT_PUBLIC_EPOS_REPUTATION as `0x${string}`;
export const EPOS_DEPLOYMENT_BLOCK = BigInt(process.env.NEXT_PUBLIC_EPOS_DEPLOYMENT_BLOCK || "40817974");

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const eposProfilesAbi = [
  {
    type: "function",
    name: "claimUsername",
    stateMutability: "nonpayable",
    inputs: [{ name: "username", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "usernameByWallet",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "username", type: "string" }],
  },
] as const;

export const eposRequestsAbi = [
  {
    type: "event",
    name: "RequestCreated",
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "username", type: "string", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RequestFulfilled",
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "giver", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "createRequest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [{ name: "requestId", type: "uint256" }],
  },
  {
    type: "function",
    name: "fulfillRequest",
    stateMutability: "nonpayable",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "nextRequestId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export interface OnchainRequestEvent {
  id: string;
  recipient: `0x${string}`;
  token: `0x${string}`;
  amount: number;
  reason: string;
  username: string;
  createdAt: string;
  status: "open" | "fulfilled";
  fulfilledBy: string | null;
  fulfilledAt: string | null;
  transactionHash: `0x${string}`;
  fulfillmentTransactionHash: `0x${string}` | null;
}

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function toUsdcUnits(amount: number): bigint {
  return parseUnits(amount.toString(), 6);
}

export function fromUsdcUnits(amount: bigint): number {
  return Number(formatUnits(amount, 6));
}

export function requestSlug(username: string, reason: string, requestId: string): string {
  const cleanReason =
    reason
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 24) || "request";
  return `${username}-${cleanReason}-${requestId}`;
}

export async function getEthBalance(address: `0x${string}`): Promise<number> {
  const balance = await publicClient.getBalance({ address });
  return Number(formatEther(balance));
}

export async function getUsdcBalance(address: `0x${string}`): Promise<number> {
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
  return fromUsdcUnits(balance);
}

export function friendlyContractError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("user denied") || lower.includes("rejected the request")) {
    return "You cancelled the wallet confirmation.";
  }
  if (lower.includes("insufficient funds")) {
    return "This wallet needs Base Sepolia ETH for gas.";
  }
  if (message.includes("UsernameTaken")) {
    return "That username is already taken.";
  }
  if (message.includes("WalletAlreadyClaimed")) {
    return "This wallet already claimed a username.";
  }
  if (message.includes("InvalidUsername")) {
    return "Username must be 3-15 characters: lowercase letters, numbers, or underscore.";
  }
  if (message.includes("UsernameNotClaimed")) {
    return "Claim your username first.";
  }
  if (message.includes("CannotFulfillOwnRequest")) {
    return "You cannot fulfill your own request.";
  }
  if (message.includes("RequestAlreadyFulfilled")) {
    return "This request is already fulfilled.";
  }
  if (message.includes("ERC20InsufficientBalance") || lower.includes("transfer amount exceeds balance")) {
    return "This wallet does not have enough Base Sepolia USDC.";
  }
  return message || "Transaction failed.";
}

export async function sendContractTransaction({
  provider,
  account,
  to,
  data,
}: {
  provider: Eip1193Provider;
  account: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
}) {
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: custom(provider),
  });
  const hash = await walletClient.sendTransaction({ account, to, data });

  return publicClient.waitForTransactionReceipt({ hash });
}

async function getBlockIso(blockNumber: bigint, cache: Map<string, string>): Promise<string> {
  const key = blockNumber.toString();
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const block = await publicClient.getBlock({ blockNumber });
  const iso = new Date(Number(block.timestamp) * 1000).toISOString();
  cache.set(key, iso);
  return iso;
}

export async function fetchOnchainRequests(): Promise<OnchainRequestEvent[]> {
  try {
    const latest = await publicClient.getBlockNumber();
    
    let cachedRequests: OnchainRequestEvent[] = [];
    let lastScannedBlock = EPOS_DEPLOYMENT_BLOCK;
    
    const CACHE_KEY = "epos.onchain.cache.v3";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.requests) && parsed.lastScannedBlock) {
            cachedRequests = parsed.requests;
            lastScannedBlock = BigInt(parsed.lastScannedBlock);
          }
        } catch {
          // ignore parsing error
        }
      }
    }
    
    const MAX_INITIAL_SCAN_BLOCKS = BigInt(100_000);
    let fromBlock = lastScannedBlock + BigInt(1);
    
    if (latest - lastScannedBlock > MAX_INITIAL_SCAN_BLOCKS || lastScannedBlock > latest) {
      fromBlock = latest > MAX_INITIAL_SCAN_BLOCKS ? latest - MAX_INITIAL_SCAN_BLOCKS : EPOS_DEPLOYMENT_BLOCK;
      cachedRequests = []; // reset cache on huge gap or network reset
    }
    
    let newCreatedLogs: any[] = [];
    let newFulfilledLogs: any[] = [];
    
    if (fromBlock <= latest) {
      const [createdChunk, fulfilledChunk] = await Promise.all([
        publicClient.getContractEvents({
          address: EPOS_REQUESTS_ADDRESS,
          abi: eposRequestsAbi,
          eventName: "RequestCreated",
          fromBlock,
          toBlock: latest,
        }),
        publicClient.getContractEvents({
          address: EPOS_REQUESTS_ADDRESS,
          abi: eposRequestsAbi,
          eventName: "RequestFulfilled",
          fromBlock,
          toBlock: latest,
        }),
      ]);
      newCreatedLogs = createdChunk;
      newFulfilledLogs = fulfilledChunk;
    }
    
    const blockTimes = new Map<string, string>();
    const newFulfillments = new Map<
      string,
      { giver: string; fulfilledAt: string; transactionHash: `0x${string}` }
    >();
    
    for (const log of newFulfilledLogs) {
      if (!log.args.requestId || !log.args.giver || !log.blockNumber) {
        continue;
      }
      newFulfillments.set(log.args.requestId.toString(), {
        giver: log.args.giver,
        fulfilledAt: await getBlockIso(log.blockNumber, blockTimes),
        transactionHash: log.transactionHash,
      });
    }
    
    const newRequests: OnchainRequestEvent[] = [];
    for (const log of newCreatedLogs) {
      const { requestId, recipient, token, amount, username, reason } = log.args;
      if (!requestId || !recipient || !token || amount === undefined || !username || !reason || !log.blockNumber) {
        continue;
      }
      const id = requestId.toString();
      const fulfillment = newFulfillments.get(id);
      newRequests.push({
        id,
        recipient,
        token,
        amount: fromUsdcUnits(amount),
        reason,
        username,
        createdAt: await getBlockIso(log.blockNumber, blockTimes),
        status: fulfillment ? "fulfilled" : "open",
        fulfilledBy: fulfillment?.giver ?? null,
        fulfilledAt: fulfillment?.fulfilledAt ?? null,
        transactionHash: log.transactionHash,
        fulfillmentTransactionHash: fulfillment?.transactionHash ?? null,
      });
    }
    
    const requestsMap = new Map<string, OnchainRequestEvent>(
      cachedRequests.map((req) => [req.id, req])
    );
    
    for (const req of newRequests) {
      requestsMap.set(req.id, req);
    }
    
    for (const [id, fulfillment] of newFulfillments.entries()) {
      const cached = requestsMap.get(id);
      if (cached && cached.status === "open") {
        requestsMap.set(id, {
          ...cached,
          status: "fulfilled",
          fulfilledBy: fulfillment.giver,
          fulfilledAt: fulfillment.fulfilledAt,
          fulfillmentTransactionHash: fulfillment.transactionHash,
        });
      }
    }
    
    const mergedRequests = Array.from(requestsMap.values()).sort(
      (a, b) => Number(BigInt(b.id) - BigInt(a.id))
    );
    
    if (typeof window !== "undefined") {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          lastScannedBlock: latest.toString(),
          requests: mergedRequests,
        })
      );
    }
    
    return mergedRequests;
  } catch (error) {
    console.error("fetchOnchainRequests error:", error);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("epos.onchain.cache.v3");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.requests)) {
            return parsed.requests;
          }
        } catch {}
      }
    }
    throw error;
  }
}

export function encodeClaimUsername(username: string) {
  return encodeFunctionData({
    abi: eposProfilesAbi,
    functionName: "claimUsername",
    args: [username],
  });
}

export function encodeCreateRequest(amount: number, reason: string) {
  return encodeFunctionData({
    abi: eposRequestsAbi,
    functionName: "createRequest",
    args: [USDC_ADDRESS, toUsdcUnits(amount), reason],
  });
}

export function encodeApproveUsdc(amount: number) {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [EPOS_REQUESTS_ADDRESS, toUsdcUnits(amount)],
  });
}

export function encodeFulfillRequest(requestId: bigint) {
  return encodeFunctionData({
    abi: eposRequestsAbi,
    functionName: "fulfillRequest",
    args: [requestId],
  });
}
