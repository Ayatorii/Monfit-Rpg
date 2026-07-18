/**
 * simulateBattle.ts
 *
 * Pure, isolated battle simulation. Takes two stat blocks, returns a
 * fully resolved battle log + result + rewards.
 *
 * Designed to be lifted server-side later: no DOM, no React, no side effects.
 * When auth + backend exist, move this into an API route and replace the
 * direct call with a fetch. The return shape should not need to change.
 */

export type StatBlock = { STR: number; AGI: number; VIT: number };

export type RoundEvent = {
  round: number;
  /** Which fighter acted (dealt the hit or attempted and dodged) */
  actor: "player" | "npc";
  action: "hit" | "dodge";
  /** Damage dealt (0 on dodge) */
  damage: number;
  /** Target's HP after this event (player's HP when actor=npc, npc's HP when actor=player) */
  targetHpAfter: number;
};

export type BattleLog = {
  events: RoundEvent[];
  result: "win" | "loss" | "draw";
  rewards: { gold: number; xp: number };
  /** Final HP values for result display */
  playerHpFinal: number;
  npcHpFinal: number;
  playerHpMax: number;
  npcHpMax: number;
};

const MAX_ROUNDS = 5;
const MIN_DAMAGE = 5;

function calcMaxHp(stats: StatBlock): number {
  return 80 + stats.VIT * 2;
}

/**
 * Clamps a number between [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns the chance that the DEFENDER dodges the attacker's strike.
 * Higher defender AGI → more likely to dodge.
 */
function dodgeChance(attackerAGI: number, defenderAGI: number): number {
  return clamp((defenderAGI - attackerAGI) * 0.01, 0, 0.2);
}

/**
 * Computes raw damage from attacker to defender, with ±15% random variance
 * and a minimum floor so fights don't stall.
 */
function calcDamage(
  attackerSTR: number,
  defenderVIT: number,
  rng: () => number,
): number {
  const base = attackerSTR * 4;
  const variance = 0.85 + rng() * 0.3; // 0.85–1.15
  const raw = base * variance - defenderVIT * 1.5;
  return Math.max(MIN_DAMAGE, Math.round(raw));
}

/**
 * Simulate a single attack action. Mutates hpRef in-place.
 * Returns the RoundEvent.
 */
function simulateAttack(
  actor: "player" | "npc",
  round: number,
  attackerSTR: number,
  attackerAGI: number,
  defenderVIT: number,
  defenderAGI: number,
  hpRef: { value: number },
  rng: () => number,
): RoundEvent {
  const dodge = rng() < dodgeChance(attackerAGI, defenderAGI);

  if (dodge) {
    return {
      round,
      actor,
      action: "dodge",
      damage: 0,
      targetHpAfter: hpRef.value,
    };
  }

  const damage = calcDamage(attackerSTR, defenderVIT, rng);
  hpRef.value = Math.max(0, hpRef.value - damage);

  return {
    round,
    actor,
    action: "hit",
    damage,
    targetHpAfter: hpRef.value,
  };
}

/**
 * Run the full battle simulation. Deterministic given the same rng sequence.
 *
 * @param playerStats - player's full {STR, AGI, VIT} stat block (base + equipped bonuses)
 * @param npcStats    - NPC's stat block
 * @param rewards     - gold/xp granted on a win
 * @param rng         - random function (default Math.random, injectable for tests)
 */
export function simulateBattle(
  playerStats: StatBlock,
  npcStats: StatBlock,
  rewards: { gold: number; xp: number },
  rng: () => number = Math.random,
): BattleLog {
  const playerHpMax = calcMaxHp(playerStats);
  const npcHpMax = calcMaxHp(npcStats);
  const playerHp = { value: playerHpMax };
  const npcHp = { value: npcHpMax };
  const events: RoundEvent[] = [];

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // Higher AGI acts first within the round; ties go to player
    const playerFirst = playerStats.AGI >= npcStats.AGI;

    if (playerFirst) {
      // Player attacks NPC
      events.push(
        simulateAttack(
          "player",
          round,
          playerStats.STR,
          playerStats.AGI,
          npcStats.VIT,
          npcStats.AGI,
          npcHp,
          rng,
        ),
      );
      if (npcHp.value <= 0) break;

      // NPC attacks player
      events.push(
        simulateAttack(
          "npc",
          round,
          npcStats.STR,
          npcStats.AGI,
          playerStats.VIT,
          playerStats.AGI,
          playerHp,
          rng,
        ),
      );
      if (playerHp.value <= 0) break;
    } else {
      // NPC attacks first
      events.push(
        simulateAttack(
          "npc",
          round,
          npcStats.STR,
          npcStats.AGI,
          playerStats.VIT,
          playerStats.AGI,
          playerHp,
          rng,
        ),
      );
      if (playerHp.value <= 0) break;

      // Player attacks NPC
      events.push(
        simulateAttack(
          "player",
          round,
          playerStats.STR,
          playerStats.AGI,
          npcStats.VIT,
          npcStats.AGI,
          npcHp,
          rng,
        ),
      );
      if (npcHp.value <= 0) break;
    }
  }

  // Determine result
  let result: "win" | "loss" | "draw";
  if (npcHp.value <= 0 && playerHp.value <= 0) {
    result = "draw";
  } else if (npcHp.value <= 0) {
    result = "win";
  } else if (playerHp.value <= 0) {
    result = "loss";
  } else {
    // Both survived — compare HP percentage
    const playerPct = playerHp.value / playerHpMax;
    const npcPct = npcHp.value / npcHpMax;
    if (playerPct > npcPct) result = "win";
    else if (npcPct > playerPct) result = "loss";
    else result = "draw";
  }

  return {
    events,
    result,
    rewards: result === "win" ? rewards : { gold: 0, xp: 0 },
    playerHpFinal: playerHp.value,
    npcHpFinal: npcHp.value,
    playerHpMax,
    npcHpMax,
  };
}

// ─── Win-probability estimate ─────────────────────────────────────────────────

const _NO_REWARDS = { gold: 0, xp: 0 };

/**
 * Monte Carlo win-probability estimate.
 *
 * Runs `simulateBattle` N times and returns a value in [0, 1].
 * Draws contribute 0.5 so the estimate is smooth rather than binary.
 * 150 runs ≈ ±4 % margin of error at 95 % confidence — fast enough to
 * run synchronously for all NPCs without any perceptible lag.
 */
export function estimateWinProbability(
  playerStats: StatBlock,
  npcStats: StatBlock,
  runs = 150,
): number {
  let score = 0;
  for (let i = 0; i < runs; i++) {
    const { result } = simulateBattle(playerStats, npcStats, _NO_REWARDS);
    if (result === "win") score += 1;
    else if (result === "draw") score += 0.5;
  }
  return score / runs;
}
