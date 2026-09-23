import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NoCompletionResponse, retryIndependent, retrySameOperation, retryWithNewOperation } from './create-vm.ts';

function receiver(protect: boolean) {
  const seen = new Set<string | null>();
  let calls = 0;
  let vms = 0;
  return {
    async createVM(id: string | null) {
      calls++;
      if (!protect || !seen.has(id)) { vms++; seen.add(id); }
      if (calls === 1) throw new NoCompletionResponse();
    },
    get vms() { return vms; },
  };
}

test('weak repeat can create two VMs', async () => {
  const client = receiver(false);
  await retryIndependent(client, { size: 'small' });
  assert.equal(client.vms, 2);
});
test('same P protects one VM under stronger contract', async () => {
  const client = receiver(true);
  await retrySameOperation(client, { size: 'small' }, 'P');
  assert.equal(client.vms, 1);
});
test('P then Q can create two VMs', async () => {
  const client = receiver(true);
  await retryWithNewOperation(client, { size: 'small' }, 'P', 'Q');
  assert.equal(client.vms, 2);
});
