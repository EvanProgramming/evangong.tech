---
slug: kards-ai-simulator
title: Teaching a Card Game Agent to Think in States
excerpt: Kards AI turns a complex card game into a deterministic environment for simulation, self-play, and reinforcement-learning research.
date: 2026-07-18
modified: 2026-08-14
author: Evan Gong
tags:
  - AI
  - Reinforcement Learning
  - Simulation
featured: true
cover: /blog/kards-ai/cover.webp
imageAlt: Kards AI simulator research environment for deterministic card game reinforcement learning
keywords:
  - Kards AI
  - reinforcement learning
  - AlphaZero
  - game simulation
readingTime: 8
---

## Why start without a UI?

KARDS is a strategically dense World War II card game. For an AI system, the first challenge is not drawing a battlefield. It is defining what the battlefield means at every moment.

Kards AI therefore begins as a headless rules simulator. The game is represented as deterministic Python code: cards, state, actions, turns, effects, and battlefield rules all need to agree before a training loop can produce meaningful data.

## Make the rules executable

The simulator includes a card loader, serializable game state, action handling, turn flow, and an effect engine. Card abilities and keywords are handled through an extensible custom-handler framework rather than being scattered across one large conditional block.

This separation makes a useful distinction. The rules engine answers what is legal and what happened. The learning system answers which legal action is worth exploring. Keeping those questions apart makes debugging training failures possible.

## Self-play as a measurement tool

The training layer follows an AlphaZero-style policy/value approach. Self-play produces games, a replay buffer stores training examples, and the network learns both a distribution over actions and an estimate of the position.

PUCT-style search can then use those estimates to balance familiar moves against unexplored branches. The value of the approach is not that it removes engineering work. It makes the engineering work measurable: a change to the rules, search, or network can be compared through the behavior of the resulting games.

## The catalog is part of the environment

The project uses the 1488-card unmodified `kards.info` catalog as its single source of truth. That constraint is important. If the data changes silently while the simulator evolves, a model can appear to improve while learning a world that does not match the game it is meant to play.

The work is still research infrastructure rather than a finished game-playing product. Its purpose is to make the environment explicit enough that better agents can be built on top of it.

## The lesson so far

Before an agent can be clever, the world around it has to be precise. A headless simulator is not the visible part of a game AI, but it is where the meaning of every later result begins.
