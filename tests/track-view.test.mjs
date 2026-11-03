import { test } from "node:test";
import assert from "node:assert/strict";
import { trackViewOnce } from "../src/features/consumer/utils/trackViewOnce.js";

test("records one view per video and reads the server count after success", async () => {
  const viewed = new Set();
  const calls = [];
  const api = {
    recordView: async (id) => calls.push(["view", id]),
    playback: async (id) => {
      calls.push(["playback", id]);
      return { views: 42 };
    },
  };

  const first = trackViewOnce("video-1", viewed, api);
  const duplicate = trackViewOnce("video-1", viewed, api);
  assert.equal(await first, 42);
  assert.equal(await duplicate, undefined);
  assert.deepEqual(calls, [
    ["view", "video-1"],
    ["playback", "video-1"],
  ]);
  assert.equal(await trackViewOnce("video-2", viewed, api), 42);
  assert.equal(calls.length, 4);
});

test("does not retry an ambiguous failed view request", async () => {
  const viewed = new Set();
  let calls = 0;
  const api = {
    recordView: async () => {
      calls++;
      throw new Error("network timeout");
    },
    playback: async () =>
      assert.fail("must not fetch the count after a failed POST"),
  };

  await assert.rejects(trackViewOnce("video-1", viewed, api));
  assert.equal(await trackViewOnce("video-1", viewed, api), undefined);
  assert.equal(calls, 1);
});
