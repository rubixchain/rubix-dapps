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

APP_CONFIG_LOCATION = "../app.node.json"

def update_config(
        user_did="",
        non_quorum_node_address="",
        nft_contract_hash = "",
        nft_contract_path = ""
    ):
    config_data = get_config()

    if user_did != "":
        config_data["user_did"] = user_did
    
    if non_quorum_node_address != "":
        config_data["non_quorum_node_address"] = non_quorum_node_address

    if nft_contract_hash != "":
        config_data["nft_contract_hash"] = nft_contract_hash

    if nft_contract_path != "":
        config_data["nft_contract_path"] = nft_contract_path
    
    with open(APP_CONFIG_LOCATION, 'w') as f:
        json.dump(config_data, f, indent=4)

def get_config():
    config_data = {}

    with open(APP_CONFIG_LOCATION, 'r') as file:
        config_data = json.load(file)

    return config_data