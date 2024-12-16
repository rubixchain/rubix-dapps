from prerequisite import clone_and_build, get_os_info, \
    generate_ipfs_swarm_key, download_ipfs_binary
from node.quorum import run_quorum_nodes
from node.non_quorum import run_non_quorum_nodes
from node.actions import generate_smart_contract, deploy_smart_contract, subscribe_smart_contract
from app.app_config import update_config, get_config

import os
import requests

script_dir = os.path.dirname(os.path.abspath(__file__))


def deploy_nft_contract(deployer_did):
    feature = "nft"

    wasm_file_path = os.path.abspath(os.path.join(script_dir, os.path.join("..", "backend", "nft_contract", "artifacts", "nft_contract.wasm")))
    raw_code_path = os.path.abspath(os.path.join(script_dir, os.path.join("..", "backend", "nft_contract", "src", "lib.rs")))
    state_file_json = os.path.abspath(os.path.join(script_dir, "state.json"))

    contract_hash = generate_smart_contract(wasm_file_path, raw_code_path, state_file_json, deployer_did, 20005, 10505)
    
    deploy_smart_contract(contract_hash, deployer_did, 20005, 10505)

    subscribe_smart_contract(contract_hash, 20005, 10505)

    app_config = get_config()
    
    # Register Dapp Callback URLs
    register_callback_url(app_config["non_quorum_node_address"], contract_hash, app_config["contracts_info"][feature]["callback_url"])
    
    update_config(feature=feature, contract_hash=contract_hash, contract_path=wasm_file_path)
    

def deploy_ft_contract(deployer_did):
    feature = "ft"

    wasm_file_path = os.path.abspath(os.path.join(script_dir, os.path.join("..", "backend", "ft_contract", "artifacts", "ft_contract.wasm")))
    raw_code_path = os.path.abspath(os.path.join(script_dir, os.path.join("..", "backend", "ft_contract", "src", "lib.rs")))
    state_file_json = os.path.abspath(os.path.join(script_dir, "state.json"))

    contract_hash = generate_smart_contract(wasm_file_path, raw_code_path, state_file_json, deployer_did, 20005, 10505)
    
    deploy_smart_contract(contract_hash, deployer_did, 20005, 10505)

    subscribe_smart_contract(contract_hash, 20005, 10505)

    app_config = get_config()
    
    # Register Dapp Callback URLs
    register_callback_url(app_config["non_quorum_node_address"], contract_hash, app_config["contracts_info"][feature]["callback_url"])
    
    update_config(feature=feature, contract_hash=contract_hash, contract_path=wasm_file_path)
    

def register_callback_url(rubix_node_url, contract_hash, callback_url_endpoint):
    callback_url = f"http://localhost:8080{callback_url_endpoint}"
    
    payload = {
        "SmartContractToken": contract_hash,
        "CallBackURL": callback_url
    }

    api = f"{rubix_node_url}/api/register-callback-url"

    response = requests.post(api, json = payload)
    response_body = response.json()

    if not response_body["status"]:
        raise Exception(f"failed to register callback url {callback_url}, error: ", response_body["message"])

    print(f"Callback url {callback_url} has been registered")

if __name__=='__main__':
    os_name, build_folder = get_os_info()
    complete_binary_path = os.path.join(os.path.abspath("./rubixgoplatform"), build_folder)

    # Clone and build Rubixgoplatform
    clone_and_build("https://github.com/rubixchain/rubixgoplatform.git", "development", os_name)

    generate_ipfs_swarm_key(complete_binary_path)

    download_ipfs_binary(os_name, "v0.21.0", complete_binary_path)

    os.chdir("../")

    # Run quorum nodes
    run_quorum_nodes(False, False, quorum_list_file_name=complete_binary_path+"/quorumlist.json")
    
    # Run Non-Quorum node
    deployer_did = run_non_quorum_nodes(1)    

    # Deploy Contracts
    deploy_nft_contract(deployer_did=deployer_did)
    deploy_ft_contract(deployer_did=deployer_did)