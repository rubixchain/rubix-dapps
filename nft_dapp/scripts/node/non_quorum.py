from .quorum import get_quorum_config
from .actions import setup_rubix_nodes, create_and_register_did, add_quorums, add_peer_details, fund_did_with_rbt
from .utils import save_to_config_file
from app.app_config import update_config


def run_non_quorum_nodes(n_nodes):
    start_idx = 5
    quorum_config = get_quorum_config()

    non_quorum_config = setup_rubix_nodes(start_idx, start_idx + n_nodes - 1)
    for idx in range(n_nodes):
        node_key = "node" + str(start_idx + idx)

        config_param = non_quorum_config[node_key]
        
        server_port, grpc_port = config_param["server"], config_param["grpcPort"]
        deployer_did = create_and_register_did(config_param, "did_contract_deployer", register_did=True)

        user_did = create_and_register_did(config_param, "did_user", register_did=True)

        fund_did_with_rbt(config_param, user_did)
        fund_did_with_rbt(config_param, deployer_did)

        update_config(user_did=user_did, non_quorum_node_address="http://localhost:20005")
        add_quorums(non_quorum_config, node_key)
    
        for _, val in quorum_config.items():
            add_peer_details(val["peerId"], val["dids"]["did_quorum"]["did"], val["dids"]["did_quorum"]["did_type"], server_port, grpc_port)

    return deployer_did