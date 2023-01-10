
from pyteal import *

# npm run start -FAST_REFRESH=true

def approval_program():

  count = Bytes("count")
  local_count = Bytes("local_count")

  def handle_creation():
    return Seq(
      App.globalPut(count, Int(0)),
      Approve()
    )

  def handle_updateapp():
    return Return(Txn.sender() == Global.creator_address())

  def handle_deleteapp():
    return Return(Txn.sender() == Global.creator_address())

  def convert_uint_to_string(uint):
    result = '"' + str(uint) + '"'
    return result

  def create_ASA():
    # global_index = Btoi(Txn.application_args[1])
    # local_index = Btoi(Txn.application_args[2])
    assetName = Txn.application_args[1]

    return Seq(
      # global_index, local_index, assetName,
      Assert(
        And(
          Gtxn[0].rekey_to() == Global.zero_address(),
          Gtxn[1].rekey_to() == Global.zero_address(),
          Gtxn[0].type_enum() == TxnType.ApplicationCall,
          Txn.group_index() == Int(0),
          Global.group_size() == Int(2)
        )
      ),
      App.globalPut(Bytes(convert_uint_to_string(count)), assetName),
      App.globalPut(count, App.globalGet(count) + Int(1) ),

      App.localPut(Txn.sender(), Bytes(convert_uint_to_string(local_count)), assetName),
      App.localPut(Txn.sender(), local_count, App.localGet(Txn.sender(), local_count) + Int(1)),

      Approve()
    )

  
  def send_ASA():

    receiverASABalance = AssetHolding.balance(Txn.accounts[1], Txn.assets[0])
    return Seq(
      receiverASABalance,

      Assert(
        And(
          Gtxn[0].rekey_to() == Global.zero_address(),
          Gtxn[1].rekey_to() == Global.zero_address(),
          Gtxn[0].type_enum() == TxnType.ApplicationCall,
          Txn.group_index() == Int(0),
          Global.group_size() == Int(2),
          Gtxn[1].asset_amount() > Int(0),
          # Make sure receiver is opted into the asset
          receiverASABalance.hasValue()
        ),
      ),
      Approve()
    )
  handle_optin=Seq([
    App.localPut(Txn.sender(), local_count, Int(0)),
    Approve()
  ])

  handle_noop=Seq(
    Cond(
      [Txn.application_args[0] == Bytes("create_ASA"), create_ASA()],
      [Txn.application_args[0] == Bytes("send_ASA"), send_ASA()]
    ),
    Reject()
  )


  program = Cond(
      [Txn.application_id() == Int(0), handle_creation()],
      [Txn.on_completion() == OnComplete.OptIn, handle_optin],
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
    