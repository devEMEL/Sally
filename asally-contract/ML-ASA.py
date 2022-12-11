
from pyteal import *

# npm run start -FAST_REFRESH=true

def approval_program():

  def handle_creation():
    return Seq(Approve())

  def handle_updateapp():
    return Return(Txn.sender() == Global.creator_address())

  def handle_deleteapp():
    return Return(Txn.sender() == Global.creator_address())

  def create_ASA():
    return Seq(
      Assert(
				And(
					*[
            Gtxn[i].rekey_to() == Global.zero_address()
            for i in range(2)
          ]
        ),
        And(
          Gtxn[0].type_enum() == TxnType.ApplicationCall,
          Txn.group_index() == Int(1),
          Global.group_size() == Int(2)
        )
      ),
      Approve()
    )

  
  def send_ASA():
    # receiverASABalance = AssetHolding.balance(Gtxn[1].asset_receiver(), Gtxn[1].xfer_asset())
    # receiverASABalance = AssetHolding.balance(Txn.accounts[1], Txn.assets[0])
    return Seq(
      # receiverASABalance,

      Assert(
        And(
          Gtxn[0].rekey_to() == Global.zero_address(),
          Gtxn[1].rekey_to() == Global.zero_address(),
          Gtxn[0].type_enum() == TxnType.ApplicationCall,
          Txn.group_index() == Int(0),
          Global.group_size() == Int(2),
          # Gtxn[1].asset_amount() > Int(0),
          # Make sure receiver is opted into the asset
          # receiverASABalance.hasValue()
        ),
      )
    )
    

  handle_noop=Seq(
    Cond(
      [Txn.application_args[0] == Bytes("create_ASA"), create_ASA()],
      [Txn.application_args[0] == Bytes("send_ASA"), send_ASA()]
    ),
    Reject()
  )


  program = Cond(
      [Txn.application_id() == Int(0), handle_creation()],
      [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp()],
      [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp()],
      [Txn.on_completion() == OnComplete.NoOp, handle_noop]
  )

  return compileTeal(program, Mode.Application, version=5)

def clear_program():
  program = Approve()
  return compileTeal(program, Mode.Application, version=5)

if __name__ == "__main__":
  
  with open('asally-approval.teal', 'w') as teal:
    teal.write(approval_program())

  with open('asally-clear.teal', 'w') as teal:
    teal.write(clear_program())
    