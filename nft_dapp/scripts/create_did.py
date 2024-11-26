from node.actions import create_and_register_did, fund_did_with_rbt

if __name__=='__main__':
    config = {
        "server": "20005",
        "grpcPort": "10505",
        "dids": {}
    }

    did = create_and_register_did(config=config, did_alias="did_new")

    fund_did_with_rbt(config, did)

    print(f"DID {did} has been created")
    pass