---
name: spendGold race condition pattern
description: Why React state updater functions must not be used to gate synchronous side-effects like API calls.
---

The rule: never capture a flag inside a React state updater function and read that flag immediately after calling the setter.

**Why:** React state updater functions (the `setFoo(prev => newValue)` form) run during the render phase, not at the moment the setter is called. Any variable mutated inside the updater will still have its pre-call value when read synchronously on the next line. This means the API call guard will always see `false` and the server call will never fire, causing the UI to diverge from the DB.

```js
// BUG — success is always false at the if() check:
let success = false;
setGold(g => { if (g < amount) { success = false; return g; } success = true; return g - amount; });
if (success) adjustMyPlayer(...); // never executes

// FIX — read from a ref that mirrors the state synchronously:
const goldRef = useRef(0);
useEffect(() => { goldRef.current = gold; }, [gold]);

if (goldRef.current < amount) return false;
setGold(g => Math.max(0, g - amount));
adjustMyPlayer(...); // always fires when it should
```

**How to apply:** Whenever you need to check state synchronously before firing an API call in a callback, maintain a `useRef` mirror of that state value. Update it with a `useEffect`. Check the ref, not the state value captured by `useCallback` closure.
