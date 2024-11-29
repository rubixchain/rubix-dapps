from node.commands import cmd_shutdown_node

if __name__=='__main__':
    node_indices = [0,1,2,3,4,5]

    base_server = 20000
    base_grpc_server = 10500

    for idx in node_indices:
        server = base_server + idx
        grpc_server = base_grpc_server + idx

        cmd_shutdown_node(server, grpc_server)

        print(f"Rubix node running on {server} has shutdown successfully")
    pass