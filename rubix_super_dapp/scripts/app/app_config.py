'''
Sample App Config:

{
	"user_did": "bafymdi1...",
	"non_quorum_node_address": "<complete address of the Non Quorum Node>"
	"nft_contract_hash": "<Smart Contract Hash>"
	"nft_contract_path": "<node folder>/SmartContract/<nft_contract_hash>/<wasm_file>.wasm"
}
'''
import json
import os

# Use absolute path
APP_CONFIG_LOCATION = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../app.node.json"))

def create_default_config():
    default_config = {
        "user_did": "",
        "non_quorum_node_address": "",
        "nft_contract_hash": "",
        "nft_contract_path": ""
    }
    with open(APP_CONFIG_LOCATION, 'w') as f:
        json.dump(default_config, f, indent=4)
    return default_config

def update_config(
        feature="",
        user_did="",
        non_quorum_node_address="",
        contract_hash = "",
        contract_path = ""
    ):
    config_data = get_config()
    
    if user_did != "":
        config_data["user_did"] = user_did
    
    if non_quorum_node_address != "":
        config_data["non_quorum_node_address"] = non_quorum_node_address

    if contract_hash != "":
        config_data["contracts_info"][feature]["contract_hash"] = contract_hash

    if contract_path != "":
        config_data["contracts_info"][feature]["contract_path"] = contract_path
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(APP_CONFIG_LOCATION), exist_ok=True)
    
    with open(APP_CONFIG_LOCATION, 'w') as f:
        json.dump(config_data, f, indent=4)

def get_config():
    if not os.path.exists(APP_CONFIG_LOCATION):
        return create_default_config()
        
    try:
        with open(APP_CONFIG_LOCATION, 'r') as file:
            return json.load(file)
    except (json.JSONDecodeError, FileNotFoundError):
        return create_default_config()
