---
name: Expo mobile preview quirks
description: Reusable validation notes for Expo Router mobile artifacts in this workspace.
---

Expo Router’s web `Slot` wrapper throws in development when a child passed through `Link asChild` has an array-valued `style`; flatten that specific child style with `StyleSheet.flatten` rather than changing the visual tokens.

**Why:** Native builds do not expose this web-only Slot validation, so iOS/Android bundle success alone does not prove the Replit Expo preview will render.

**How to apply:** When an Expo preview falls into the error boundary with a Slot style warning, inspect Metro’s client log for the exact `asChild` child and flatten only that route-link style. The container may also log a missing `libglib` library while installing optional React Native DevTools; Metro can still bundle and serve the app.

The workspace’s minimum-release-age policy can also temporarily block same-day Expo patch releases during `expo install --fix`; do not bypass that policy just to make `expo-doctor` green when the existing SDK versions build and typecheck.

**Why:** Expo patch packages can be published after the current day’s maturity window, while the app remains compatible with the already-installed patch set.

**How to apply:** Record the blocked doctor check as an environment constraint, keep the safe dependency versions, and rely on TypeScript plus iOS/Android bundle builds for completion validation.