/**
 * ERC-8021 Transaction Attribution Utilities
 * Base Builder Code: bc_c5vycviw
 */
export const BUILDER_CODE = 'bc_c5vycviw';

export function getAttributionCode(action: string) {
  // Mock function representing dynamic generation of attribution codes per action
  return `[ATTRIBUTION_CODE_${action.toUpperCase()}_WITH_${BUILDER_CODE}]`;
}

export function buildERC8021Transaction(to: string, data: string, action: string) {
  const attribution = getAttributionCode(action);
  // This would ideally pack the attribution inside calldata or emit it,
  // following the ERC-8021 spec mechanics.
  console.log(`[ERC-8021] Packing transaction with attribution: ${attribution}`);
  return {
    to,
    data, // + encoded attribution if it was smart contract ready
    attribution
  };
}
