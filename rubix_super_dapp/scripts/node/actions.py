from .commands import cmd_run_rubix_servers, cmd_get_peer_id, cmd_create_did, cmd_register_did, \
    cmd_generate_rbt, cmd_add_quorum_dids, cmd_setup_quorum_dids, get_build_dir, cmd_add_peer_details, \
    cmd_generate_smart_contract, cmd_deploy_smart_contract, cmd_subscribe_smart_contract
from .utils import get_node_name_from_idx, get_did_by_alias, save_to_config_file

def generate_smart_contract(wasm_file_path, code_file_path, state_file_path, deployer_did, server_port, grpc_port):
    return cmd_generate_smart_contract(wasm_file_path, code_file_path, state_file_path, deployer_did, server_port, grpc_port)

def deploy_smart_contract(contract_hash, deployer_did, server_port, grpc_port):
    return cmd_deploy_smart_contract(contract_hash, deployer_did, server_port, grpc_port)

def subscribe_smart_contract(contract_hash, server_port, grpc_port):
    return cmd_subscribe_smart_contract(contract_hash, server_port, grpc_port)

def add_quorums(node_config: dict, node_key = "", quorumlist = "quorumlist.json"):
    if node_key == "":
        for config in node_config.values():
            cmd_add_quorum_dids(
                config["server"], 
                config["grpcPort"]
            )
    else:
        config = node_config[node_key]
        cmd_add_quorum_dids(
            config["server"], 
            config["grpcPort"],
            quorumlist
        )

def setup_quorums(node_config: dict, node_did_alias_map: dict):
    for node, config in node_config.items():
        did = get_did_by_alias(config, node_did_alias_map[node])        
        cmd_setup_quorum_dids(
            did,
            config["server"],
            config["grpcPort"],
        )

def quorum_config(node_config: dict, node_did_alias_map: dict, skip_adding_quorums: bool = False, quorum_list_file_name = "quorumlist.json"):
    # Prepare quorumlist.json
    quorum_list = []
    build_dir = get_build_dir()
 
    if skip_adding_quorums:
        setup_quorums(node_config, node_did_alias_map)
    else:
        for node, config in node_config.items():
            did = get_did_by_alias(config, node_did_alias_map[node])
            quorum_info = {
                "type": 2,
                "address": did
            }
            
            quorum_list.append(quorum_info)

        save_to_config_file(quorum_list_file_name, quorum_list)
        print("quorum saved to ", quorum_list_file_name)
        add_quorums(node_config)

        setup_quorums(node_config, node_did_alias_map)


def setup_testnet_node(idx):
    node_name = "node" + str(idx)
    node_server, grpc_server = cmd_run_rubix_servers(node_name, idx, isTestnet=True)

    cfg = {
        "dids": {},
        "server": node_server,
        "grpcPort": grpc_server,
        "peerId": "",
    }

    fetch_peer_id(cfg)

    return cfg

def setup_rubix_nodes(node_start_idx, node_end_idx, isTestnet=True):
    node_config = {}
    for idx in range(node_start_idx, node_end_idx+1):
        node_name = "node" + str(idx)
        node_server, grpc_server = cmd_run_rubix_servers(node_name, idx, isTestnet)

        cfg = {
            "dids": {},
            "server": node_server,
            "grpcPort": grpc_server,
            "peerId": "",
        }

        fetch_peer_id(cfg)
        node_config[node_name] = cfg

    return node_config

def fetch_peer_id(config):
    peer_id = cmd_get_peer_id(config["server"], config["grpcPort"])
    config["peerId"] = peer_id

def create_and_register_did(config: dict, did_alias: str, did_type: int = 4, register_did: bool = True, fp: bool = False):
    if fp:
        print(f"creating did with fp flag")
        did = cmd_create_did(config["server"], config["grpcPort"], did_type, "p123", "q123")
        print(f"DID {did} has been created successfully")
        config["dids"][did_alias] = {}
        config["dids"][did_alias]["did"] = did
        config["dids"][did_alias]["did_type"] = did_type

        if register_did:
            cmd_register_did(did, config["server"], config["grpcPort"], "p123")
            print(f"DID {did} has been registered successfully")

        return did
    else:
        did = cmd_create_did(config["server"], config["grpcPort"], did_type)
        print(f"DID {did} has been created successfully")

        config["dids"][did_alias] = {}
        config["dids"][did_alias]["did"] = did
        config["dids"][did_alias]["did_type"] = did_type

        if register_did:
            cmd_register_did(did, config["server"], config["grpcPort"])
            print(f"DID {did} has been registered successfully")

        return did

def fund_did_with_rbt(node_config: dict, did: str,  rbt_amount: int = 70, priv_pwd="mypassword"):
    cmd_generate_rbt(did, rbt_amount, node_config["server"], node_config["grpcPort"], priv_pwd)
    print("DID ", did, f" is funded with {rbt_amount} RBT")

def add_peer_details(peer_id: str, did_id: str, did_type: int, server_port: int, grpc_port: int):
    cmd_add_peer_details(peer_id, did_id, did_type, server_port, grpc_port)