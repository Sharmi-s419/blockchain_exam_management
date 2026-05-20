import json
from web3 import Web3

# Connected to Hardhat local node
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

def record_score_on_blockchain(user_id, exam_id, score_hash, contract_address):
    # This assumes hardhat network is running and we use the first account
    if not w3.is_connected():
        print("Web3 Provider not connected!")
        return None

    w3.eth.default_account = w3.eth.accounts[0]
    
    # Load ABI from compiled contract
    # Adjust path accordingly in production
    import os
    from django.conf import settings
    
    abi_path = os.path.join(settings.BASE_DIR.parent, 'blockchain', 'artifacts', 'contracts', 'ExamRecords.sol', 'ExamRecords.json')
    try:
        with open(abi_path, 'r') as f:
            contract_json = json.load(f)
            abi = contract_json['abi']
    except Exception as e:
        print(f"Error loading ABI: {e}")
        return None

    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    try:
        tx_hash = contract.functions.addRecord(user_id, exam_id, score_hash).transact()
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt.transactionHash.hex()
    except Exception as e:
        print(f"Blockchain tx failed: {e}")
        return None
