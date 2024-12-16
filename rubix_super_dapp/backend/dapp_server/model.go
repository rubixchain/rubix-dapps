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

type ContractInfo struct {
	ContractHash string `json:"contract_hash"`
	ContractPath string `json:"contract_path"`
	CallBackUrl  string `json:"callback_url"`
}

type Config struct {
	UserDid       string                   `json:"user_did"`
	NodeAddress   string                   `json:"non_quorum_node_address"`
	ContractsInfo map[string]*ContractInfo `json:"contracts_info"`
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
