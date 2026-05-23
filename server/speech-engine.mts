/**
 * Compatibility entrypoint for Render dashboards still using:
 *   npx tsx server/speech-engine.mts
 *
 * The real server lives in engine/server.mjs
 */
import "../engine/server.mjs";
