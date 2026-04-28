# Okay. No jargon. Simple English. Full picture.

---

# The Epos Flow — Start to Finish

---

## PART 1 — SETTING UP (The Recipient)

**Tunde wants to receive money on Epos.**

He goes to epos.xyz. He sees a "Sign In" button.

He clicks it. Privy shows him options — sign in with his **email, phone number, or Twitter account.** No MetaMask. No seed phrase. No crypto knowledge needed.

He signs in with his Gmail.

Privy **silently creates a crypto wallet for him in the background.** He never sees it. He never touches it. It just exists — attached to his Gmail login.

He picks his username. He types **@tunde.** That username gets registered onchain — it is now permanently linked to his wallet. Nobody else can take @tunde.

His profile is live at **epos.xyz/@tunde.**

---

## PART 2 — CREATING A REQUEST

Tunde needs ₦20,000 for school fees.

He clicks **"Create Epos".**

He fills in three things:
- Amount → 15 USDC (roughly ₦20,000)
- Reason → "School fees abeg 🙏"

He hits **"Generate Link."**

Epos creates a unique link — **epos.xyz/pay/tunde/school-fees-001**

That link is now stored on the Base blockchain permanently. It contains Tunde's wallet address, the amount, and the reason. Anyone who opens that link can pay him.

Tunde copies the link and posts it on Twitter. He also posts it in his WhatsApp group. He drops it in his Instagram bio.

---

## PART 3 — THE FEED

The moment Tunde creates his request, it appears in the **Epos Feed** — the public timeline that everyone on Epos scrolls.

People see:

```text
@tunde
"School fees abeg 🙏"
15 USDC  |  0 of 1 fulfilled
[React]  [Epos Him]
```

People who cannot pay react. 🙏👀. The reactions boost his request higher in the feed. More people see it.

His **Sapa Streak** counter starts. Day 1. Day 2. Day 3. The longer it runs unfulfilled, the more the algorithm pushes it up.

---

## PART 4 — SOMEONE WANTS TO PAY (The Sender)

Amaka sees Tunde's request. She is in London. She wants to help.

She clicks **"Epos Him."**

She lands on the payment page. She sees:

```text
@tunde is requesting 15 USDC
Reason: School fees abeg 🙏

[Connect Wallet]
```

She connects her wallet. Maybe she has Phantom on Solana. Maybe she has MetaMask on Base. Maybe she is also new to crypto and signs in with her email through Privy — and gets a wallet created for her on the spot.

**It does not matter which network she is on.**

---

## PART 5 — THE PAYMENT MAGIC (Circle CCTP)

Here is where the quiet magic happens — and Amaka sees none of it.

Amaka has USDC on Solana. Tunde's wallet is on Base.

Amaka clicks **"Send."**

Under the hood:
1. Epos sees Amaka is on Solana
2. It calls Circle CCTP
3. CCTP **burns** 15 USDC on Solana — it disappears from Amaka's Solana wallet
4. CCTP **mints** 15 fresh USDC on Base — it appears in Tunde's Base wallet
5. The whole thing takes about 20 seconds

Amaka sees: **"Payment sent ✅"**

Tunde sees: **"15 USDC received 🎉"**

Nobody selected a chain. Nobody paid a bridge fee. Nobody even knew two different blockchains were involved. It just worked.

---

## PART 6 — THE CELEBRATION

The moment the payment lands:

- Tunde's request in the Feed flips to **"FULFILLED 🎉"**
- Everyone who reacted gets a notification
- Both Tunde and Amaka receive a **receipt card** — a shareable graphic that says *"Amaka eposed Tunde ✅"*
- Amaka's fulfillment count goes up — she climbs the **Oga of the Week** leaderboard
- If she hits top 3 by Friday, the 👑 crown appears on her profile

Amaka posts the receipt card on Twitter. Her followers see it. Some of them click through to Epos. The cycle repeats.

---

## PART 7 — TUNDE CASHES OUT (The Offramp)

Tunde now has 15 USDC sitting in his Epos wallet. He wants Naira.

He clicks **"Withdraw to Bank."**

He enters his **GTBank account number.**

Epos sends his 15 USDC to Yellow Card's API in the background. Yellow Card converts it to Naira at the current rate and sends it via bank transfer to his GTBank account.

Within minutes — **₦20,000 lands in Tunde's bank account.**

He gets the **"Bag Secured 🎒"** card. He posts it on Twitter.

Total fees paid: less than ₦200. Western Union would have charged ₦3,000+.

---

## THE FULL LOOP IN ONE PICTURE

```text
Tunde signs up with Gmail
          ↓
Privy creates his wallet silently
          ↓
He claims @tunde onchain
          ↓
He creates a 15 USDC request
          ↓
Link goes live + appears in the Feed
          ↓
Amaka clicks the link in London
          ↓
She connects her Phantom wallet (Solana)
          ↓
She hits Send
          ↓
CCTP burns USDC on Solana ← → mints USDC on Base
          ↓
Tunde receives 15 USDC on Base
          ↓
Feed celebrates. Receipt cards generated.
          ↓
Amaka gains clout. Climbs leaderboard.
          ↓
Tunde clicks Withdraw to Bank
          ↓
Yellow Card converts USDC → Naira
          ↓
₦20,000 lands in GTBank
          ↓
Tunde posts "Bag Secured 🎒"
          ↓
His followers discover Epos
          ↓
The loop starts again
```

---

**That is the entire product.** From Gmail signup to Naira in the bank — the user never thinks about blockchains, wallets, USDC, or any crypto concept. They just think about **eposing** and **getting eposed.**
