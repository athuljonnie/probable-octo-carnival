// callForwardingHelpers.ts

/**
 * Check if call forwarding is initialized for a given user.
 * @param userId The user (client) ID
 * @returns Boolean indicating if call forwarding is initialized
 */
export function getCallForwardingStateForUser(userId: string): boolean {
  const key = `callForwardingData_${userId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    return parsed.callForwardingInitialized === '1';
  } catch (err) {
    console.error('Failed to parse call forwarding state:', err);
    return false;
  }
}

/**
 * Mark call forwarding as initialized for a given user.
 * @param userId The user (client) ID
 */
export function setCallForwardingStateForUser(userId: string) {
  const key = `callForwardingData_${userId}`;
  const data = {
    callForwardingInitialized: '1',
    userId,
    // You can store other items here as needed
  };
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Remove call forwarding state for a given user.
 * @param userId The user (client) ID
 */
export function removeCallForwardingStateForUser(userId: string) {
  const key = `callForwardingData_${userId}`;
  localStorage.removeItem(key);
}
