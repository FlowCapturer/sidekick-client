import { useState, useEffect } from "react";

// Returns seconds left; starts from initial value and counts down to 0
export function useCountdown(initialSeconds = 30) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsLeft]);

  return secondsLeft;
}
