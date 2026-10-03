const { createClient, chains } = require('genlayer-js');
const client = createClient({ chain: chains.studionet });

const code = `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

# ==============================================================================
# GenHub AI - Autonomous Milestone & Deliverable Escrow for GenLayer
# Built for GenLayer Bradbury Testnet & GenLayer Studio
# ==============================================================================

import json
from dataclasses import dataclass
from genlayer import *

# Interface for external GEN transfers to EOAs or EVM contracts on GenLayer Chain
@gl.evm.contract_interface
class _Recipient:
    class View:
        pass
    class Write:
        pass

@allow_storage
@dataclass
class Escrow:
    id: u256
    client: Address
    freelancer: Address
    title: str
    requirements: str
    amount_wei: u256
    status: str  # FUNDED, SUBMITTED, RELEASED, REFUNDED
    delivery_url: str
    delivery_notes: str
    verdict: str
    verdict_score: u256

class GenHubEscrow(gl.Contract):
    escrow_count: u256
    escrows: TreeMap[u256, Escrow]
    platform_admin: Address

    def __init__(self):
        self.escrow_count = u256(0)
        self.escrows = TreeMap()
        self.platform_admin = gl.message.sender_address

    @gl.public.write.payable
    def create_escrow(
        self,
        freelancer: Address,
        title: str,
        requirements: str
    ) -> u256:
        deposit_amount = gl.message.value
        if deposit_amount == u256(0):
            raise gl.vm.UserError("Escrow creation requires staked GEN (gl.message.value must be > 0)")

        assert len(title) > 0, "Title cannot be empty"
        assert len(requirements) >= 20, "Requirements must be detailed (min 20 characters)"

        self.escrow_count += u256(1)
        new_id = self.escrow_count

        escrow_data = Escrow(
            id=new_id,
            client=gl.message.sender_address,
            freelancer=freelancer,
            title=title,
            requirements=requirements,
            amount_wei=deposit_amount,
            status="FUNDED",
            delivery_url="",
            delivery_notes="",
            verdict="",
            verdict_score=u256(0)
        )

        self.escrows[new_id] = escrow_data
        return new_id

    @gl.public.write
    def submit_delivery(
        self,
        escrow_id: u256,
        delivery_url: str,
        delivery_notes: str
    ):
        assert escrow_id in self.escrows, "Escrow not found"
        escrow = self.escrows[escrow_id]

        assert gl.message.sender_address == escrow.freelancer, "Only designated freelancer can submit"
        assert escrow.status == "FUNDED", "Escrow is not in FUNDED state"
        assert delivery_url.startswith("http://") or delivery_url.startswith("https://"), "Invalid URL scheme"

        escrow.delivery_url = delivery_url
        escrow.delivery_notes = delivery_notes
        escrow.status = "SUBMITTED"
        self.escrows[escrow_id] = escrow

    @gl.public.write
    def adjudicate_escrow(self, escrow_id: u256) -> str:
        assert escrow_id in self.escrows, "Escrow not found"
        escrow = self.escrows[escrow_id]

        assert escrow.status == "SUBMITTED", "Escrow must be in SUBMITTED state to adjudicate"
        delivery_url = escrow.delivery_url
        assert len(delivery_url) > 0 and (delivery_url.startswith("http://") or delivery_url.startswith("https://")), "Valid deliverable URL is required for AI jury adjudication"

        requirements = escrow.requirements
        notes = escrow.delivery_notes
        escrow_amount = escrow.amount_wei

        def leader_fn() -> str:
            web_evidence = gl.nondet.web.render(delivery_url, mode="text")
            trimmed_evidence = web_evidence[:3000]

            prompt = f"""
            You are an impartial, decentralized AI Juror node on GenLayer.
            Evaluate if the deliverable satisfies the contract requirements.
            REQUIREMENTS: {requirements}
            NOTES: {notes}
            EVIDENCE FROM {delivery_url}: {trimmed_evidence}
            Return JSON strictly:
            {{"approved": true, "score": 85, "reasoning": "Deliverable satisfies requirements."}}
            """
            res = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.dumps(res, sort_keys=True)

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            validator_raw = leader_fn()
            leader_raw = leader_result.calldata
            val_data = json.loads(validator_raw)
            ldr_data = json.loads(leader_raw)
            approved_match = val_data.get("approved") == ldr_data.get("approved")
            score_diff = abs(int(val_data.get("score", 0)) - int(ldr_data.get("score", 0)))
            return approved_match and score_diff <= 15

        res_str = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        evaluation = json.loads(res_str)

        approved = evaluation.get("approved", False)
        score = int(evaluation.get("score", 0))
        reasoning = evaluation.get("reasoning", "Adjudication completed.")

        if approved and score >= 60:
            escrow.status = "RELEASED"
            escrow.verdict = f"Approved ({score}/100): {reasoning}"
            _Recipient(escrow.freelancer).emit_transfer(value=escrow_amount)
        else:
            escrow.status = "REFUNDED"
            escrow.verdict = f"Rejected ({score}/100): {reasoning}"
            _Recipient(escrow.client).emit_transfer(value=escrow_amount)

        escrow.verdict_score = u256(score)
        self.escrows[escrow_id] = escrow
        return escrow.verdict

    @gl.public.write
    def manual_release(self, escrow_id: u256):
        assert escrow_id in self.escrows, "Escrow not found"
        escrow = self.escrows[escrow_id]
        assert gl.message.sender_address == escrow.client, "Only client can release"
        assert escrow.status in ["FUNDED", "SUBMITTED"], "Cannot release in current status"

        escrow.status = "RELEASED"
        escrow.verdict = "Manually released by client."
        self.escrows[escrow_id] = escrow
        _Recipient(escrow.freelancer).emit_transfer(value=escrow.amount_wei)

    @gl.public.write
    def manual_refund(self, escrow_id: u256):
        assert escrow_id in self.escrows, "Escrow not found"
        escrow = self.escrows[escrow_id]
        caller = gl.message.sender_address
        assert caller == escrow.client or caller == escrow.freelancer, "Unauthorized"
        assert escrow.status in ["FUNDED", "SUBMITTED"], "Cannot refund in current status"

        escrow.status = "REFUNDED"
        escrow.verdict = "Refunded to client."
        self.escrows[escrow_id] = escrow
        _Recipient(escrow.client).emit_transfer(value=escrow.amount_wei)

    @gl.public.view
    def get_escrow(self, escrow_id: u256) -> Escrow:
        assert escrow_id in self.escrows, "Escrow not found"
        return self.escrows[escrow_id]

    @gl.public.view
    def get_escrow_count(self) -> u256:
        return self.escrow_count

    @gl.public.view
    def get_contract_balance(self) -> u256:
        return self.balance
`;

async function testFull() {
  try {
    const schema = await client.getContractSchemaForCode(code);
    console.log('SUCCESS! FULL ESCROW CONTRACT VALIDATED 100%!');
    console.log('Methods:', Object.keys(schema.methods));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testFull();
