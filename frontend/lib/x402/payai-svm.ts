/**
 * PayAI facilitator limits for the x402 `exact` scheme on Solana (SVM).
 * @see https://docs.payai.network/x402/reference — §6.2 Exact Scheme on Solana
 *
 * Do NOT raise client compute limits toward 200_000: that exceeds facilitator
 * validation and surfaces as `invalid_exact_svm_payload_transaction_compute_limit_too_high`.
 *
 * RentChain uses `x402-solana` for payment txs (SPL USDC `TransferChecked`, not SOL transfers).
 */
export const PAYAI_MAX_COMPUTE_UNITS = 40_000 as const
export const PAYAI_MAX_COMPUTE_UNIT_PRICE_MICROLAMPORTS = 5 as const

/** Default used by `x402-solana` client (within PayAI max). */
export const X402_SOLANA_DEFAULT_COMPUTE_UNITS = 20_000 as const
