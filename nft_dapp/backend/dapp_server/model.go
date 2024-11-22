package main

const (
	Pending = 0
	Success = 1
	Failed  = 2
)

type ContractInputRequest struct {
	Port              string `json:"port"`
	SmartContractHash string `json:"smart_contract_hash"` //port should also be added here, so that the api can understand which node.
}

type Config struct {
	UserDid         string `json:"user_did"`
	NodeAddress     string `json:"non_quorum_node_address"`
	NftContractHash string `json:"nft_contract_hash"`
	NftContractPath string `json:"nft_contract_path"`
	DappServerApi   string `json:"dapp_server_api"`
}

type SmartContractDataReply struct {
	BasicResponse
	SCTDataReply []SCTDataReply
}

type BasicResponse struct {
	Status  bool        `json:"status"`
	Message string      `json:"message"`
	Result  interface{} `json:"result"`
}

type SCTDataReply struct {
	BlockNo           uint64
	BlockId           string
	SmartContractData string
}
