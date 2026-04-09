import { useState, useEffect, useRef } from 'react';

/**
 * Generic polling hook.
 * @param {Function} queryFn - async function to call on each interval
 * @param {Function} stopCondition - (data) => boolean — stops polling when true
 * @param {number} intervalMs - polling interval in ms (default 3000)
 * @param {number} timeoutMs - max time in ms before timeout error (default 60000)
 * @param {boolean} enabled - start polling only when true
 */
export function usePolling({ queryFn, stopCondition, intervalMs = 3000, timeoutMs = 60000, enabled = true }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    stoppedRef.current = false;
    setIsLoading(true);
    setIsTimeout(false);
    setError(null);

    const poll = async () => {
      if (stoppedRef.current) return;
      try {
        const result = await queryFn();
        const responseData = result?.data ?? result;
        setData(responseData);

        if (stopCondition(responseData)) {
          stop();
          setIsLoading(false);
        }
      } catch (err) {
        stop();
        setError(err);
        setIsLoading(false);
      }
    };

    const stop = () => {
      stoppedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    timeoutRef.current = setTimeout(() => {
      stop();
      setIsTimeout(true);
      setIsLoading(false);
    }, timeoutMs);

    return stop;
  }, [enabled, intervalMs, timeoutMs]); // eslint-disable-line

  return { data, isLoading, isTimeout, error };
}
