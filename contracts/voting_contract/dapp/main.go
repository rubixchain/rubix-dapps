/*package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

// Vote matches Rust struct
type Vote struct {
	VoterID string `json:"voter_id"`
	Color   string `json:"color"`
}

type VotesInput struct {
	Votes []Vote `json:"votes"`
}

type ContractResponse struct {
	Msg string `json:"msg"`
}

var wasmModule *wasmbridge.WasmModule

func main() {
	// Initialize WASM module once
	wasmFile := "/Users/arnab/TRIE-internal/contracts/voting_contract/artifacts/voting_contract.wasm"
	hostFnRegistry := wasmbridge.NewHostFunctionRegistry()

	var err error
	wasmModule, err = wasmbridge.NewWasmModule(wasmFile, hostFnRegistry)
	if err != nil {
		panic(fmt.Errorf("Failed to initialize WASM module: %v", err))
	}

	r := gin.Default()
	r.POST("/api/voting-contract", votingHandler)
	fmt.Println("Server running at http://localhost:8080/")
	r.Run(":8080")
}

func votingHandler(c *gin.Context) {
	var input VotesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	// Reset previous votes
	fmt.Println("Calling: reset_votes")
	resetMsg, err := callWasmFunc("reset_votes", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("reset_votes response:", resetMsg)

	// Cast votes
	for _, vote := range input.Votes {
		voteJson, _ := json.Marshal(vote)
		fmt.Printf("Calling: cast_vote with input: %s\n", string(voteJson))
		castResp, err := callWasmFunc("cast_vote", string(voteJson))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("cast_vote response:", castResp)
	}

	// Tally
	fmt.Println("Calling: tally_votes")
	tallyMsg, err := callWasmFunc("tally_votes", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("tally_votes response:", tallyMsg)

	// Winner
	fmt.Println("Calling: get_winner")
	winnerMsg, err := callWasmFunc("get_winner", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("get_winner response:", winnerMsg)

	// Final output
	c.JSON(http.StatusOK, gin.H{
		"tally":  tallyMsg,
		"winner": winnerMsg,
	})
}

// callWasmFunc formats the input correctly and calls the WASM contract function
func callWasmFunc(funcName string, input string) (string, error) {
	payload := map[string]string{
		funcName: input,
	}
	jsonReq, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal input for %s: %v", funcName, err)
	}

	fmt.Printf("Calling WASM function: %s with payload: %s\n", funcName, string(jsonReq))
	output, err := wasmModule.CallFunction(string(jsonReq))
	if err != nil {
		return "", fmt.Errorf("failed to call %s: %v", funcName, err)
	}

	var resp ContractResponse
	if err := json.Unmarshal([]byte(output), &resp); err != nil {
		return "", fmt.Errorf("invalid response from %s: %v", funcName, err)
	}

	return resp.Msg, nil
}
*/

/*package main

import (
	"encoding/json"
	"fmt"
	"path"

	"github.com/gin-gonic/gin"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

func main() {
	r := gin.Default()
	r.POST("/api/voting-contract", handleVotingContract)
	r.Run(":8080")
}

func wrapError(f func(code int, obj any), msg string) {
	fmt.Println(msg)
	f(404, gin.H{"status": "error", "message": msg})
}

func wrapSuccess(f func(code int, obj any), msg string) {
	fmt.Println(msg)
	f(200, gin.H{"status": "success", "message": msg})
}

func handleVotingContract(c *gin.Context) {
	nodeAddress := "http://localhost:20009"
	contractPath := path.Join("/Users/arnab/TRIE-internal/contracts/voting_contract/artifacts/voting_contract.wasm")

	// Read request body
	var contractInput struct {
		Method  string                 `json:"method"`
		Payload map[string]interface{} `json:"payload"`
	}
	if err := c.ShouldBindJSON(&contractInput); err != nil {
		wrapError(c.JSON, "Invalid request body")
		return
	}

	// Load WASM module
	hostFnRegistry := wasmbridge.NewHostFunctionRegistry()
	wasmModule, err := wasmbridge.NewWasmModule(contractPath, hostFnRegistry, wasmbridge.WithRubixNodeAddress(nodeAddress))
	if err != nil {
		wrapError(c.JSON, fmt.Sprintf("failed to load wasm module: %v", err))
		return
	}

	// Auto-call register_vote if needed
	if (contractInput.Method == "tally_votes" || contractInput.Method == "get_winner") &&
		contractInput.Payload["voter_id"] != nil && contractInput.Payload["color"] != nil {

		registerCall := map[string]interface{}{
			"register_vote": map[string]interface{}{
				"voter_id": contractInput.Payload["voter_id"],
				"color":    contractInput.Payload["color"],
			},
		}
		registerJSON, _ := json.Marshal(registerCall)
		_, _ = wasmModule.CallFunction(string(registerJSON))
	}

	// Reformat the input to { method: payload }
	contractCall := map[string]interface{}{
		contractInput.Method: contractInput.Payload,
	}
	inputBytes, err := json.Marshal(contractCall)
	if err != nil {
		wrapError(c.JSON, fmt.Sprintf("failed to marshal contract input: %v", err))
		return
	}

	// Execute
	result, err := wasmModule.CallFunction(string(inputBytes))
	if err != nil {
		wrapError(c.JSON, fmt.Sprintf("failed to call contract function: %v", err))
		return
	}

	// Parse result
	message, errMsg := extractContractOutput(result)
	if errMsg != "" {
		wrapError(c.JSON, fmt.Sprintf("contract execution failed: %v", errMsg))
		return
	}

	wrapSuccess(c.JSON, message)
}

// Extract output from contract response format: "msg: ... , err: ..."
func extractContractOutput(result string) (string, string) {
	var out struct {
		Msg string `json:"msg"`
	}
	if err := json.Unmarshal([]byte(result), &out); err == nil && out.Msg != "" {
		return out.Msg, ""
	}
	// Raw error fallback
	return "", result
}
*/

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"sync"

	"github.com/gin-gonic/gin"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

var (
	voteStore = make(map[string]string) // map[voter_id]color
	storeLock = sync.Mutex{}
)

func main() {
	r := gin.Default()
	r.POST("/api/voting-contract", handleVotingContract)
	r.Run(":8080")
}

func wrapError(f func(code int, obj any), msg string) {
	fmt.Println("ERROR:", msg)
	f(http.StatusBadRequest, gin.H{"status": "error", "message": msg})
}

func wrapSuccess(f func(code int, obj any), msg string) {
	fmt.Println("SUCCESS:", msg)
	f(http.StatusOK, gin.H{"status": "success", "message": msg})
}

func handleVotingContract(c *gin.Context) {
	nodeAddress := "http://localhost:20009"
	contractPath := path.Join("/Users/arnab/TRIE-internal/contracts/voting_contract/artifacts/voting_contract.wasm")

	var contractInput struct {
		Method  string                 `json:"method"`
		Payload map[string]interface{} `json:"payload"`
	}
	if err := c.ShouldBindJSON(&contractInput); err != nil {
		wrapError(c.JSON, "Invalid request body")
		return
	}

	method := contractInput.Method
	payload := contractInput.Payload

	switch method {
	case "cast_and_tally":
		voterID, ok1 := payload["voter_id"].(string)
		color, ok2 := payload["color"].(string)
		if !ok1 || !ok2 {
			wrapError(c.JSON, "Missing or invalid voter_id or color")
			return
		}

		storeLock.Lock()
		voteStore[voterID] = color
		tally := make(map[string]int)
		for _, c := range voteStore {
			tally[c]++
		}

		// Determine winner
		winner := ""
		maxVotes := -1
		for color, count := range tally {
			if count > maxVotes {
				maxVotes = count
				winner = color
			}
		}
		storeLock.Unlock()

		result := fmt.Sprintf("Vote recorded. Tally: %v. Current winner: %s", tally, winner)
		wrapSuccess(c.JSON, result)
		return

	default:
		// Default fallback to wasm contract execution
		hostFnRegistry := wasmbridge.NewHostFunctionRegistry()
		wasmModule, err := wasmbridge.NewWasmModule(contractPath, hostFnRegistry, wasmbridge.WithRubixNodeAddress(nodeAddress))
		if err != nil {
			wrapError(c.JSON, fmt.Sprintf("failed to load wasm module: %v", err))
			return
		}

		input := map[string]interface{}{method: payload}
		inputBytes, _ := json.Marshal(input)
		result, err := wasmModule.CallFunction(string(inputBytes))
		if err != nil {
			wrapError(c.JSON, fmt.Sprintf("failed to call contract function: %v", err))
			return
		}

		msg, errMsg := extractContractOutput(result)
		if errMsg != "" {
			wrapError(c.JSON, fmt.Sprintf("contract execution failed: %v", errMsg))
			return
		}
		wrapSuccess(c.JSON, msg)
	}
}

func extractContractOutput(result string) (string, string) {
	var out struct {
		Msg string `json:"msg"`
	}
	if err := json.Unmarshal([]byte(result), &out); err == nil && out.Msg != "" {
		return out.Msg, ""
	}
	return "", result
}
